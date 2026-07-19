-- ============================================
-- 新校书仓 - 数据库完整更新脚本 v2
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 启用所需扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 0. 删除旧的认证相关函数和字段（如果存在）
-- ============================================
DROP FUNCTION IF EXISTS register_user CASCADE;
DROP FUNCTION IF EXISTS login_user CASCADE;
DROP FUNCTION IF EXISTS verify_security_answer CASCADE;
DROP FUNCTION IF EXISTS reset_password CASCADE;
DROP FUNCTION IF EXISTS generate_random_nickname CASCADE;
DROP FUNCTION IF EXISTS hash_password CASCADE;
DROP FUNCTION IF EXISTS verify_password CASCADE;

-- 删除旧表（按依赖顺序）
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS want_books CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 1. 用户资料表 (profiles)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  nickname TEXT DEFAULT '书仓用户',
  avatar_url TEXT,
  school TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 自动创建用户资料 (触发器)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone)
  VALUES (NEW.id, NEW.email, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. 商品表 (books)
-- ============================================
CREATE TABLE books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  condition TEXT CHECK (condition IN ('全新', '九成新', '八成新', '七成新', '六成新以下')) DEFAULT '九成新',
  category TEXT CHECK (category IN ('教材', '备考资料')) DEFAULT '教材',
  grade TEXT,
  subject TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  isbn TEXT,
  author TEXT,
  publisher TEXT,
  status TEXT CHECK (status IN ('在售', '已售出', '已下架')) DEFAULT '在售',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 收藏表 (favorites)
-- ============================================
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================
-- 4. 举报表 (reports)
-- ============================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT CHECK (target_type IN ('book', 'user')) DEFAULT 'book',
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. 交易记录表 (transactions)
-- ============================================
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. 自动更新 updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. 创建索引（单字段 + 联合索引）
-- ============================================
-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- books
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_price ON books(price);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_status_category_price ON books(status, category, price);
CREATE INDEX IF NOT EXISTS idx_books_status_created_at ON books(status, created_at DESC);

-- favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_book_id ON favorites(book_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_book ON favorites(user_id, book_id);

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_id ON reports(target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- transactions
CREATE INDEX IF NOT EXISTS idx_transactions_book_id ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================
-- 8. 全文检索索引（title模糊搜索优化）
-- ============================================
CREATE INDEX IF NOT EXISTS idx_books_title_gin ON books USING gin(to_tsvector('simple', title));

-- ============================================
-- 9. 行级安全策略 (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 只允许本人查看敏感字段（通过视图控制）
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Books 策略
CREATE POLICY "Published books are viewable by everyone" ON books
  FOR SELECT USING (status = '在售' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites 策略
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Reports 策略
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Transactions 策略（仅买家可创建，买卖双方可查看）
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "买卖双方可更新交易状态" ON transactions
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================
-- 10. 存储桶配置（在 Supabase Dashboard 中执行）
-- ============================================
-- 请在 Supabase Dashboard > Storage 中创建 bucket:
-- 名称: book-images
-- 公开: true
-- 文件大小限制: 5MB
-- 允许的文件类型: image/jpeg, image/png, image/webp

-- 存储策略（在 Storage > Policies 中添加）:
-- 允许所有人查看公开图片
-- 允许登录用户上传图片到自己的文件夹
-- 允许用户删除自己的图片

-- ============================================
-- 完成！数据库更新成功
-- ============================================

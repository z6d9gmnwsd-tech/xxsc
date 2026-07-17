-- ============================================
-- 新校书仓 - 登录系统更新脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- ============================================
-- 1. 更新用户资料表，添加登录相关字段
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS security_question TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS security_answer TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname TEXT DEFAULT '';

-- ============================================
-- 2. 创建函数：生成随机用户名
-- ============================================
CREATE OR REPLACE FUNCTION generate_random_nickname()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. 创建函数：哈希密码（使用Supabase的crypt）
-- ============================================
-- 注意：需要启用pgcrypto扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. 创建函数：验证密码
-- ============================================
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. 创建用户注册函数
-- ============================================
CREATE OR REPLACE FUNCTION register_user(
  p_phone TEXT,
  p_password TEXT,
  p_security_question TEXT,
  p_security_answer TEXT
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  random_nickname TEXT;
  password_hash TEXT;
  answer_hash TEXT;
BEGIN
  -- 检查手机号是否已注册
  IF EXISTS (SELECT 1 FROM profiles WHERE phone = p_phone) THEN
    RETURN json_build_object('success', false, 'message', '该手机号已注册');
  END IF;

  -- 生成随机用户名
  random_nickname := generate_random_nickname();
  
  -- 确保用户名唯一
  WHILE EXISTS (SELECT 1 FROM profiles WHERE nickname = random_nickname) LOOP
    random_nickname := generate_random_nickname();
  END LOOP;

  -- 哈希密码和密保答案
  password_hash := hash_password(p_password);
  answer_hash := hash_password(lower(trim(p_security_answer)));

  -- 生成UUID作为id
  new_user_id := uuid_generate_v4();

  -- 创建用户（显式提供id）
  INSERT INTO profiles (id, phone, nickname, password_hash, security_question, security_answer)
  VALUES (new_user_id, p_phone, random_nickname, password_hash, p_security_question, answer_hash);

  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'nickname', random_nickname
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. 创建用户登录函数
-- ============================================
CREATE OR REPLACE FUNCTION login_user(
  p_phone TEXT,
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- 查找用户
  SELECT * INTO user_record FROM profiles WHERE phone = p_phone;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', '手机号未注册');
  END IF;

  -- 验证密码
  IF NOT verify_password(p_password, user_record.password_hash) THEN
    RETURN json_build_object('success', false, 'message', '密码错误');
  END IF;

  RETURN json_build_object(
    'success', true,
    'user_id', user_record.id,
    'nickname', user_record.nickname
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. 创建验证密保问题函数
-- ============================================
CREATE OR REPLACE FUNCTION verify_security_answer(
  p_phone TEXT,
  p_answer TEXT
)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- 查找用户
  SELECT * INTO user_record FROM profiles WHERE phone = p_phone;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', '手机号未注册');
  END IF;

  -- 验证密保答案
  IF NOT verify_password(lower(trim(p_answer)), user_record.security_answer) THEN
    RETURN json_build_object('success', false, 'message', '密保答案错误');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. 创建重置密码函数
-- ============================================
CREATE OR REPLACE FUNCTION reset_password(
  p_phone TEXT,
  p_new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  new_password_hash TEXT;
BEGIN
  -- 检查用户是否存在
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE phone = p_phone) THEN
    RETURN json_build_object('success', false, 'message', '手机号未注册');
  END IF;

  -- 哈希新密码
  new_password_hash := hash_password(p_new_password);

  -- 更新密码
  UPDATE profiles 
  SET password_hash = new_password_hash, updated_at = NOW()
  WHERE phone = p_phone;

  RETURN json_build_object('success', true, 'message', '密码重置成功');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. 设置行级安全策略
-- ============================================
-- 允许匿名用户调用注册和登录函数
GRANT EXECUTE ON FUNCTION register_user TO anon;
GRANT EXECUTE ON FUNCTION login_user TO anon;
GRANT EXECUTE ON FUNCTION verify_security_answer TO anon;
GRANT EXECUTE ON FUNCTION reset_password TO anon;

-- ============================================
-- 10. 更新profiles表的RLS策略
-- ============================================
-- 删除旧的策略
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 创建新的策略
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true);

-- ============================================
-- 完成！登录系统更新成功
-- ============================================

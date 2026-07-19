'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BookOpen,
  FileText,
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GoodsType = '教材' | '备考资料';
type MaterialType = '讲义' | '笔记' | '真题' | '其他';
type ExamType = '考研' | '考公考编' | '其他';

const GRADE_OPTIONS = ['全年级通用', '大一', '大二', '大三', '大四', '研一', '研二', '研三'];

const MAJOR_CATEGORIES: Record<string, string[]> = {
  '工学': ['计算机科学与技术', '软件工程', '电子信息工程', '通信工程', '自动化', '机械工程', '土木工程', '建筑学'],
  '理学': ['数学', '物理学', '化学', '生物学', '统计学'],
  '文学': ['中国语言文学', '外国语言文学', '新闻传播学', '艺术学'],
  '经济学': ['经济学', '金融学', '国际贸易', '会计学', '工商管理'],
  '法学': ['法学', '政治学', '社会学', '马克思主义理论'],
  '医学': ['临床医学', '口腔医学', '药学', '护理学', '中医学'],
  '教育学': ['教育学', '学前教育', '小学教育', '体育学'],
  '农学': ['农学', '林学', '动物医学', '水产'],
};

const EXAM_SUBJECTS: Record<string, string[]> = {
  '考研': ['政治', '英语一', '英语二', '数学一', '数学二', '数学三', '专业课'],
  '考公考编': ['行测', '申论', '公共基础知识', '专业知识'],
  '其他': [],
};

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const iconMap = {
    success: <Check size={16} color="#fff" />,
    error: <X size={16} color="#fff" />,
    info: <AlertCircle size={16} color="#fff" />,
  };
  const bgMap = {
    success: '#5B8C5A',
    error: '#E8590C',
    info: '#666',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        borderRadius: 24,
        background: bgMap[type],
        color: '#fff',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        animation: 'toastIn 0.3s ease-out',
      }}
    >
      {iconMap[type]}
      {message}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

interface FieldError {
  field: string;
  message: string;
}

interface FormData {
  goodsType: GoodsType;
  isbn: string;
  title: string;
  condition: string;
  author: string;
  publisher: string;
  grades: string[];
  majors: string[];
  images: string[];
  materialType: MaterialType;
  examType: ExamType;
  examSubjects: string[];
}

const INITIAL_FORM: FormData = {
  goodsType: '教材',
  isbn: '',
  title: '',
  condition: '',
  author: '',
  publisher: '',
  grades: [],
  majors: [],
  images: [],
  materialType: '讲义',
  examType: '考研',
  examSubjects: [],
};

const CONDITION_OPTIONS = ['全新', '九成新', '八成新', '七成新', '六成新及以下'];
const MATERIAL_TYPE_OPTIONS: MaterialType[] = ['讲义', '笔记', '真题', '其他'];
const EXAM_TYPE_OPTIONS: ExamType[] = ['考研', '考公考编', '其他'];

const DRAFT_KEY = 'bookcraft_draft';
const DRAFT_DEBOUNCE = 500;

export default function PublishForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [majorExpanded, setMajorExpanded] = useState(false);
  const [gradeExpanded, setGradeExpanded] = useState(false);
  const draftTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm({ ...INITIAL_FORM, ...parsed });
      }
    } catch {}
  }, []);

  const saveDraft = useCallback((data: FormData) => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      } catch {}
    }, DRAFT_DEBOUNCE);
  }, []);

  const updateForm = (patch: Partial<FormData>) => {
    setForm(prev => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
    setErrors([]);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, onClose: () => setToast(null) });
  };

  const handleScanISBN = () => {
    showToast('功能开发中', 'info');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (form.images.length + files.length > 5) {
      showToast('最多上传5张图片', 'error');
      return;
    }
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `book-covers/${Date.now()}_${i}.${ext}`;
        const { error } = await supabase.storage
          .from('book-images')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from('book-images')
          .getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }
      updateForm({ images: [...form.images, ...newUrls] });
      showToast('上传成功', 'success');
    } catch (err: any) {
      showToast(err.message || '上传失败', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    updateForm({ images: form.images.filter((_, i) => i !== index) });
  };

  const toggleGrade = (g: string) => {
    const grades = form.grades.includes(g)
      ? form.grades.filter(x => x !== g)
      : [...form.grades, g];
    updateForm({ grades });
  };

  const toggleMajor = (m: string) => {
    const majors = form.majors.includes(m)
      ? form.majors.filter(x => x !== m)
      : [...form.majors, m];
    updateForm({ majors });
  };

  const toggleExamSubject = (s: string) => {
    const examSubjects = form.examSubjects.includes(s)
      ? form.examSubjects.filter(x => x !== s)
      : [...form.examSubjects, s];
    updateForm({ examSubjects });
  };

  const validate = (): FieldError[] => {
    const errs: FieldError[] = [];
    if (form.goodsType === '教材') {
      if (!form.isbn.trim()) errs.push({ field: 'isbn', message: '请填写ISBN' });
      if (!form.title.trim()) errs.push({ field: 'title', message: '请填写书名' });
      if (!form.condition) errs.push({ field: 'condition', message: '请选择成色' });
    } else {
      if (!form.title.trim()) errs.push({ field: 'title', message: '请填写书名' });
      if (!form.condition) errs.push({ field: 'condition', message: '请选择成色' });
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      showToast('请填写所有必填项', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        showToast('请先登录', 'error');
        return;
      }
      const insertData: Record<string, any> = {
        user_id: userData.user.id,
        title: form.title.trim(),
        condition: form.condition,
        category: form.goodsType,
        price: 0,
        status: '在售',
        images: form.images,
      };
      if (form.goodsType === '教材') {
        insertData.isbn = form.isbn.trim();
        insertData.author = form.author.trim();
        insertData.publisher = form.publisher.trim();
        insertData.grades = form.grades;
        insertData.majors = form.majors;
      } else {
        insertData.material_type = form.materialType;
        insertData.exam_type = form.examType;
        insertData.exam_subjects = form.examSubjects;
      }
      const { error } = await supabase.from('books').insert(insertData);
      if (error) throw error;
      localStorage.removeItem(DRAFT_KEY);
      showToast('发布成功', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (err: any) {
      showToast(err.message || '发布失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const RequiredStar = () => (
    <span style={{ color: '#E8590C', marginRight: 4 }}>*</span>
  );

  const getErrorFor = (field: string) => errors.find(e => e.field === field);

  const renderFieldLabel = (label: string, required = false) => (
    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 8 }}>
      {required && <RequiredStar />}
      {label}
    </div>
  );

  return (
    <div style={{ padding: '16px', paddingBottom: 100 }}>
      {toast && <Toast {...toast} />}

      <style>{`
        @keyframes fieldError {
          0%, 100% { border-color: rgba(232,89,12,0.4); }
          50% { border-color: rgba(232,89,12,0.8); }
        }
        .field-error {
          animation: fieldError 1s ease 2;
          border-color: #E8590C !important;
        }
        .pill-active {
          background: #5B8C5A !important;
          color: #fff !important;
          border-color: #5B8C5A !important;
        }
        .pill-inactive {
          background: #f0f2f5 !important;
          color: #666 !important;
          border-color: transparent !important;
        }
        .type-card-active {
          background: rgba(91,140,90,0.08) !important;
          border-color: #5B8C5A !important;
          color: #5B8C5A !important;
        }
        .type-card-inactive {
          background: rgba(255,255,255,0.85) !important;
          border-color: rgba(0,0,0,0.06) !important;
          color: #999 !important;
        }
        .form-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          font-size: 15px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .form-input:focus {
          border-color: #5B8C5A;
        }
        .form-input::placeholder {
          color: #bbb;
        }
        .form-textarea {
          resize: none;
          min-height: 80px;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #5B8C5A, #4a7a49);
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 12px rgba(91,140,90,0.3);
          font-family: inherit;
        }
        .submit-btn:active {
          transform: scale(0.97);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ios-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.04);
          padding: 16px;
          margin-bottom: 12px;
        }
      `}</style>

      {/* Type Switcher */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {(['教材', '备考资料'] as GoodsType[]).map(type => (
          <div
            key={type}
            className={form.goodsType === type ? 'type-card-active' : 'type-card-inactive'}
            onClick={() => updateForm({ goodsType: type })}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '16px 12px',
              borderRadius: 14,
              border: '1.5px solid',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {type === '教材' ? (
              <BookOpen size={24} strokeWidth={1.5} />
            ) : (
              <FileText size={24} strokeWidth={1.5} />
            )}
            <span style={{ fontSize: 14, fontWeight: 500 }}>{type}</span>
          </div>
        ))}
      </div>

      {/* 教材 fields */}
      {form.goodsType === '教材' && (
        <>
          <div className="ios-card">
            {renderFieldLabel('ISBN', true)}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={`form-input ${getErrorFor('isbn') ? 'field-error' : ''}`}
                placeholder="请输入ISBN"
                value={form.isbn}
                onChange={e => updateForm({ isbn: e.target.value })}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleScanISBN}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#f0f2f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Camera size={20} color="#666" />
              </button>
            </div>
          </div>

          <div className="ios-card">
            {renderFieldLabel('书名', true)}
            <input
              className={`form-input ${getErrorFor('title') ? 'field-error' : ''}`}
              placeholder="请输入书名"
              value={form.title}
              onChange={e => updateForm({ title: e.target.value })}
            />
          </div>

          <div className="ios-card">
            {renderFieldLabel('作者')}
            <input
              className="form-input"
              placeholder="请输入作者（选填）"
              value={form.author}
              onChange={e => updateForm({ author: e.target.value })}
            />
          </div>

          <div className="ios-card">
            {renderFieldLabel('出版社')}
            <input
              className="form-input"
              placeholder="请输入出版社（选填）"
              value={form.publisher}
              onChange={e => updateForm({ publisher: e.target.value })}
            />
          </div>
        </>
      )}

      {/* 备考资料 fields */}
      {form.goodsType === '备考资料' && (
        <>
          <div className="ios-card">
            {renderFieldLabel('书名', true)}
            <input
              className={`form-input ${getErrorFor('title') ? 'field-error' : ''}`}
              placeholder="请输入资料名称"
              value={form.title}
              onChange={e => updateForm({ title: e.target.value })}
            />
          </div>

          <div className="ios-card">
            {renderFieldLabel('资料类型', true)}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MATERIAL_TYPE_OPTIONS.map(mt => (
                <button
                  key={mt}
                  className={form.materialType === mt ? 'pill-active' : 'pill-inactive'}
                  onClick={() => updateForm({ materialType: mt })}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: '1px solid',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {mt}
                </button>
              ))}
            </div>
          </div>

          <div className="ios-card">
            {renderFieldLabel('适用考试')}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EXAM_TYPE_OPTIONS.map(et => (
                <button
                  key={et}
                  className={form.examType === et ? 'pill-active' : 'pill-inactive'}
                  onClick={() => updateForm({ examType: et, examSubjects: [] })}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: '1px solid',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {et}
                </button>
              ))}
            </div>
          </div>

          {EXAM_SUBJECTS[form.examType]?.length > 0 && (
            <div className="ios-card">
              {renderFieldLabel('考试科目')}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EXAM_SUBJECTS[form.examType].map(s => (
                  <button
                    key={s}
                    className={form.examSubjects.includes(s) ? 'pill-active' : 'pill-inactive'}
                    onClick={() => toggleExamSubject(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: '1px solid',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Common fields */}
      <div className="ios-card">
        {renderFieldLabel('成色', true)}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CONDITION_OPTIONS.map(c => (
            <button
              key={c}
              className={form.condition === c ? 'pill-active' : 'pill-inactive'}
              onClick={() => updateForm({ condition: c })}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {getErrorFor('condition') && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#E8590C' }}>
            {getErrorFor('condition')?.message}
          </div>
        )}
      </div>

      {/* Grade multi-select (教材 only) */}
      {form.goodsType === '教材' && (
        <div className="ios-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setGradeExpanded(!gradeExpanded)}
          >
            {renderFieldLabel('适用年级（选填）')}
            {gradeExpanded ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
          </div>
          {gradeExpanded && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {GRADE_OPTIONS.map(g => (
                <button
                  key={g}
                  className={form.grades.includes(g) ? 'pill-active' : 'pill-inactive'}
                  onClick={() => toggleGrade(g)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: '1px solid',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          {!gradeExpanded && form.grades.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {form.grades.map(g => (
                <span
                  key={g}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 12,
                    background: '#5B8C5A',
                    color: '#fff',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Major multi-select (教材 only) */}
      {form.goodsType === '教材' && (
        <div className="ios-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setMajorExpanded(!majorExpanded)}
          >
            {renderFieldLabel('适用专业（选填）')}
            {majorExpanded ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
          </div>
          {majorExpanded && (
            <div style={{ marginTop: 4 }}>
              {Object.entries(MAJOR_CATEGORIES).map(([cat, subs]) => (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 500 }}>{cat}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {subs.map(m => (
                      <button
                        key={m}
                        className={form.majors.includes(m) ? 'pill-active' : 'pill-inactive'}
                        onClick={() => toggleMajor(m)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 16,
                          border: '1px solid',
                          fontSize: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!majorExpanded && form.majors.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {form.majors.slice(0, 5).map(m => (
                <span
                  key={m}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 12,
                    background: '#F5E6D0',
                    color: '#8B6914',
                  }}
                >
                  {m}
                </span>
              ))}
              {form.majors.length > 5 && (
                <span style={{ fontSize: 12, color: '#999', lineHeight: '24px' }}>
                  +{form.majors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image upload */}
      <div className="ios-card">
        {renderFieldLabel('图片（最多5张）')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {form.images.map((url, idx) => (
            <div
              key={idx}
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={12} color="#fff" />
              </button>
            </div>
          ))}
          {form.images.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                border: '1px dashed rgba(0,0,0,0.12)',
                background: '#f8f8f8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                cursor: 'pointer',
                opacity: uploading ? 0.5 : 1,
              }}
            >
              {uploading ? (
                <div style={{ width: 16, height: 16, border: '2px solid #ccc', borderTopColor: '#5B8C5A', borderRadius: '50%' }} className="spinner" />
              ) : (
                <Upload size={18} color="#999" />
              )}
              <span style={{ fontSize: 10, color: '#999' }}>
                {uploading ? '上传中' : '添加'}
              </span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Submit */}
      <div style={{ marginTop: 20 }}>
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '发布中...' : '发布'}
        </button>
      </div>
    </div>
  );
}

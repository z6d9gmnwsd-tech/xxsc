'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function UserAgreement() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('agreement_accepted');
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    if (!checked) return;
    localStorage.setItem('agreement_accepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.iconRow}>
            <ShieldCheck size={28} color="#8B6914" />
            <h2 style={styles.title}>用户协议与免责声明</h2>
          </div>
          <button style={styles.closeBtn} onClick={() => {}} aria-label="close">
            <X size={20} color="#999" />
          </button>
        </div>

        <div style={styles.scrollArea}>
          <div style={styles.contentBlock}>
            <h3 style={styles.sectionTitle}>一、平台定位</h3>
            <p style={styles.paragraph}>
              本平台为校园二手教材信息撮合平台，致力于为在校师生提供便捷的二手教材发布、浏览与信息对接服务。平台本身不参与任何实际交易行为，仅作为信息发布媒介存在。
            </p>
          </div>

          <div style={styles.contentBlock}>
            <h3 style={styles.sectionTitle}>二、交易方式</h3>
            <p style={styles.paragraph}>
              本平台所有交易均为线下当面交易，不涉及任何形式的在线支付、资金托管或物流配送。买卖双方需自行协商交易时间、地点及方式，并对交易过程中的安全性自行负责。
            </p>
          </div>

          <div style={styles.contentBlock}>
            <h3 style={styles.sectionTitle}>三、免责声明</h3>
            <p style={styles.paragraph}>
              平台不承担任何交易担保责任。用户之间因交易所产生的一切纠纷、损失或法律责任，均由交易双方自行协商解决，平台不承担连带责任。平台不对书籍质量、成色、真伪等进行任何形式的保证或背书。
            </p>
          </div>

          <div style={styles.contentBlock}>
            <h3 style={styles.sectionTitle}>四、禁止发布内容</h3>
            <p style={styles.paragraph}>
              用户不得在平台发布以下内容：违禁出版物、盗版书籍、虚假或误导性信息、含有违法违规内容的资料、非二手教材类广告信息、侵犯他人知识产权的内容。一经发现，平台有权立即删除相关内容并封禁相关账户。
            </p>
          </div>

          <div style={styles.contentBlock}>
            <h3 style={styles.sectionTitle}>五、举报机制</h3>
            <p style={styles.paragraph}>
              用户如发现平台上存在违规内容或不当行为，可通过举报功能向平台反馈。平台将在收到举报后尽快核实处理。对于核实属实的违规行为，平台将采取删除内容、限制功能或封禁账户等措施。
            </p>
          </div>

          <div style={styles.contentBlock}>
            <h3 style={styles.sectionTitle}>六、用户责任</h3>
            <p style={styles.paragraph}>
              用户在使用本平台时，应遵守国家法律法规及本协议规定，对自己的发布内容和交易行为承担全部法律责任。用户应妥善保管账户信息，因账户泄露或使用不当造成的损失由用户自行承担。
            </p>
          </div>
        </div>

        <div style={styles.footer}>
          <label style={styles.checkboxRow} htmlFor="agree-check">
            <input
              id="agree-check"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>我已阅读并同意上述协议内容</span>
          </label>

          <button
            style={{
              ...styles.acceptBtn,
              opacity: checked ? 1 : 0.5,
              cursor: checked ? 'pointer' : 'not-allowed',
            }}
            onClick={handleAccept}
            disabled={!checked}
          >
            同意并继续
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(4px)',
    padding: '20px',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 16,
    border: '1px solid rgba(224,201,168,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 12px',
    borderBottom: '1px solid rgba(224,201,168,0.2)',
  },
  iconRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a1a',
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    padding: 4,
    cursor: 'pointer',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
  },
  contentBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    margin: '0 0 6px',
    fontSize: 14,
    fontWeight: 600,
    color: '#8B6914',
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  paragraph: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.7,
    color: '#444',
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  footer: {
    padding: '14px 20px 20px',
    borderTop: '1px solid rgba(224,201,168,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: '#C4A882',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  acceptBtn: {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #E0C9A8, #C4A882)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
    letterSpacing: 0.5,
    transition: 'opacity 0.2s',
  },
};

export default function FooterDisclaimer() {
  return (
    <div style={styles.container}>
      <p style={styles.text}>
        本平台仅提供信息撮合服务，不参与交易过程，不承担交易担保责任
      </p>
      <div style={styles.links}>
        <a href="#" style={styles.link}>用户协议</a>
        <span style={styles.dot}>·</span>
        <a href="#" style={styles.link}>免责声明</a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px 16px 12px',
    textAlign: 'center',
  },
  text: {
    margin: 0,
    fontSize: 11,
    lineHeight: 1.6,
    color: '#999',
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  link: {
    fontSize: 11,
    color: '#999',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(153,153,153,0.4)',
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  dot: {
    fontSize: 11,
    color: '#ccc',
  },
};

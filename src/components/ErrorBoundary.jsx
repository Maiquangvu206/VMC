import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
  }

    render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Không xác định';
      const errorStack = this.state.error?.stack || '';
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '700px', width: '100%' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Ứng dụng gặp lỗi
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Đã có lỗi xảy ra khi tải trang. Vui lòng tải lại trang hoặc đăng xuất rồi đăng nhập lại.
            </p>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              color: '#f87171',
              wordBreak: 'break-word',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Lỗi: {errorMessage}</div>
              {errorStack && <div style={{ color: '#94a3b8' }}>{errorStack}</div>}
            </div>
            <button
              onClick={() => {
                if (this.state.error) {
                  console.error('Error details:', this.state.error);
                }
                window.location.reload();
              }}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

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
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] font-body p-4 text-center">
          <div className="ds-card p-8 max-w-lg w-full space-y-4">
            <h1 className="font-heading text-2xl font-bold text-white">
              Ứng dụng gặp lỗi
            </h1>
            <p className="text-sm text-slate-400">
              Đã có lỗi xảy ra khi tải trang. Vui lòng tải lại trang hoặc đăng xuất rồi đăng nhập lại.
            </p>
             <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] text-left text-xs text-red-400 font-mono max-h-[300px] overflow-y-auto">
              <div className="font-bold text-red-400 mb-2">Lỗi: {errorMessage}</div>
              {errorStack && <div className="text-slate-400">{errorStack}</div>}
            </div>
            <button
              onClick={() => {
                if (this.state.error) {
                  console.error('Error details:', this.state.error);
                }
                window.location.reload();
              }}
              className="ds-btn ds-btn-primary"
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

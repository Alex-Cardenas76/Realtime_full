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
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Algo salió mal.</h2>
                    <p>{this.state.error?.message || 'Ocurrió un error inesperado.'}</p>
                    <button onClick={() => window.location.reload()}>Recargar Página</button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { AlertTriangle, Bug, Check, Copy, Home, RefreshCw } from 'lucide-react';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      copied: false
    };

    this.maxRetries = props.maxRetries || 3;
    this.onError = props.onError;
    this.fallbackComponent = props.fallbackComponent;
    this.showResetButton = props.showResetButton !== false;
    this.showBackButton = props.showBackButton !== false;
    this.showHomeButton = props.showHomeButton || false;
    this.homeRoute = props.homeRoute || '/dashboard';
    this.backButtonText = props.backButtonText || 'Go Back';
    this.homeButtonText = props.homeButtonText || 'Go Home';
    this.enableErrorReporting = props.enableErrorReporting !== false;
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorDetails = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    console.error('Error Boundary caught an error:', error, errorInfo);

    if (this.onError) {
      this.onError(error, errorInfo, errorDetails);
    }

    if (this.enableErrorReporting) {
      this.reportError(errorDetails);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  reportError = async (errorDetails) => {
    try {
      console.log('Error reported:', errorDetails);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleReload = () => window.location.reload();

  handleReset = () => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prev.retryCount + 1
    }));
  };

  handleNavigation = (path) => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null, retryCount: 0 });
    setTimeout(() => {
      this.props.navigate(path);
    }, 0);
  };

  handleGoBack = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null, retryCount: 0 });
    setTimeout(() => {
      if (this.props.navigate) {
        this.props.navigate(-1);
        setTimeout(() => {
          if (window.location.href === this.homeRoute || window.history.length <= 1) {
            this.props.navigate(this.homeRoute);
          }
        }, 300);
      } else {
        window.history.back();
      }
    }, 0);
  };

  handleCopyError = async () => {
    const errorText = `Error ID: ${this.state.errorId}
Timestamp: ${new Date().toISOString()}
Error: ${this.state.error?.toString()}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Preferred modern API
        await navigator.clipboard.writeText(errorText);
      } else {
        // Fallback: hidden textarea
        const textArea = document.createElement("textarea");
        textArea.value = errorText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  getErrorMessage = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return "Multiple errors occurred. Please reload the page or contact support.";
    }

    if (this.state.error?.message?.includes('Network')) {
      return "Network connection issue. Please check your internet connection and try again.";
    }

    if (this.state.error?.message?.includes('ChunkLoadError')) {
      return "Application update detected. Please reload the page to get the latest version.";
    }

    return "We're sorry, but something unexpected happened. This error has been logged and we'll look into it.";
  };

  render() {
    if (this.state.hasError && this.fallbackComponent) {
      return this.fallbackComponent(this.state.error, this.state.errorInfo, this.handleReset);
    }

    if (this.state.hasError) {
      const shouldShowRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[--color-background]">
          <Card className="w-full max-w-2xl shadow-lg">
            <Box p="6">
              <Flex direction="column" align="center" gap="4">
                <Box className="p-4 rounded-full bg-[--red-3] animate-pulse">
                  <AlertTriangle size={36} color="var(--red-11)" />
                </Box>

                <div className="text-center">
                  <Heading size="6" mb="2" color="red">
                    Oops! Something went wrong
                  </Heading>
                  <Text as='p' color="gray" size="3" className="max-w-md">
                    {this.getErrorMessage()}
                  </Text>

                  {this.state.errorId && (
                    <Text as='p' size="2" color="gray" mt="2" className="font-mono">
                      Error ID: {this.state.errorId}
                    </Text>
                  )}
                </div>

                <Flex gap="3" mt="3" wrap="wrap" justify="center" className="w-full">
                  {shouldShowRetry && this.showResetButton && (
                    <Button variant="solid" color="blue" onClick={this.handleReset} className="flex-1 min-w-0">
                      <RefreshCw size={16} />
                      Try Again
                    </Button>
                  )}

                  {this.showBackButton && (
                    <Button variant="solid" color="gray" onClick={this.handleGoBack} className="flex-1 min-w-0">
                      <Home size={16} />
                      {this.backButtonText}
                    </Button>
                  )}

                  <Button variant="outline" color="gray" onClick={this.handleReload} className="flex-1 min-w-0">
                    <RefreshCw size={16} />
                    Reload Page
                  </Button>

                  {this.showHomeButton && (
                    <Button variant="outline" className="flex-1 min-w-0" onClick={() => this.handleNavigation(this.homeRoute)}>
                      <Home size={16} />
                      {this.homeButtonText}
                    </Button>
                  )}
                </Flex>

                {this.state.error && (
                  <Button
                    variant="ghost"
                    size="2"
                    color={this.state.copied ? "green" : "gray"}
                    onClick={this.handleCopyError}
                    className="mt-2"
                  >
                    {this.state.copied ? (
                      <>
                        <Check size={14} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Error Details
                      </>
                    )}
                  </Button>
                )}

                {this.state.retryCount > 0 && (
                  <Text size="2" color="orange" className="text-center">
                    Retry attempt: {this.state.retryCount}/{this.maxRetries}
                  </Text>
                )}

                {import.meta.env.DEV && this.state.error && (
                  <details open className="mt-4 w-full">
                    <summary className="text-sm text-[--gray-11] cursor-pointer hover:text-[--gray-12] flex items-center gap-2">
                      <Bug size={14} />
                      Show error details (development only)
                    </summary>
                    <Box mt="3" p="4" className="bg-[--gray-2] rounded-md border border-[--gray-6] text-xs font-mono text-[--gray-11] overflow-auto max-h-48">
                      <div className="space-y-3">
                        <div>
                          <Text as='p' size="2" weight="bold" color="red">Error:</Text>
                          <pre className="mt-1 whitespace-pre-wrap break-words">{this.state.error.toString()}</pre>
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <Text as='p' size="2" weight="bold" color="red">Stack Trace:</Text>
                            <pre className="mt-1 text-xs whitespace-pre-wrap break-words">{this.state.error.stack}</pre>
                          </div>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <Text as='p' size="2" weight="bold" color="red">Component Stack:</Text>
                            <pre className="mt-1 text-xs whitespace-pre-wrap break-words">{this.state.errorInfo.componentStack}</pre>
                          </div>
                        )}
                      </div>
                    </Box>
                  </details>
                )}
              </Flex>
            </Box>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

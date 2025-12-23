import toast from 'react-hot-toast';

export const customToast = {
  info: (message: string) => toast(message, { icon: 'ℹ️', duration: 3000 }),
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
};
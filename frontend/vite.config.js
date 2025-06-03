import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Thêm cấu hình optimizeDeps để xử lý các file .js có chứa JSX
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx', // Dòng này báo cho esbuild biết rằng các file .js cũng chứa JSX
            },
        },
    },
    // Bạn có thể thêm các cấu hình khác ở đây nếu cần, ví dụ:
    // resolve: {
    //   alias: {
    //     '@': '/src', // Thiết lập alias cho thư mục src
    //   },
    // },
    // server: {
    //   port: 3000, // Đặt cổng server phát triển
    //   open: true, // Tự động mở trình duyệt khi khởi động server
    // },
});
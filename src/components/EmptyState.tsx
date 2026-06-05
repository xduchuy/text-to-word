import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, FileCode, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onSelectTemplate: (text: string) => void;
}

const templates = [
  {
    title: "Bản thảo Báo cáo Học thuật 📚",
    description: "Định dạng ghi chú nghiên cứu khoa học với tiêu đề, danh sách, biến và bảng dữ liệu.",
    icon: BookOpen,
    content: `# Phân tích Tích hợp Năng lượng Tái tạo trong Lưới điện Thông minh

## Giới thiệu
Các nguồn năng lượng tái tạo như quang điện mặt trời và tuabin gió đã trở thành trụ cột quan trọng trong quá trình chuyển dịch năng lượng sạch. Việc tích hợp các nguồn này đòi hỏi cấu hình điều khiển thông minh.

## Phương pháp Nghiên cứu
Các nhà nghiên cứu đã mô hình hóa hệ thống lưới điện lai 10 kW bằng cách sử dụng tập dữ liệu khí tượng thực tế.
- Thu thập giá trị bức xạ mặt trời theo chu kỳ 1 phút
- Mô phỏng động học của pin lưu trữ lithium-iron-phosphate
- Mô phỏng sự thay đổi nhiệt độ môi trường theo mùa

## Thông số Mô phỏng
| Thông số | Giá trị | Đơn vị |
|---|---|---|
| Công suất cực đại của Pin mặt trời | 12.5 | kW |
| Dung lượng lưu trữ của Pin | 48.0 | kWh |
| Hiệu suất sạc xả | 92.5 | % |

> Việc điều phối bộ lưu trữ năng lượng cục bộ kết hợp các thuật toán lập lịch dự báo giúp giảm sự phụ thuộc vào lưới điện quốc gia tới 42%.

## Kết luận
Lưới điện thông minh đại diện cho giải pháp mở rộng hướng tới sự bền vững năng lượng.
`
  },
  {
    title: "Đề xuất Dự án Kinh doanh 💼",
    description: "Lập đề xuất dự án kinh doanh kèm theo các cột mốc và mốc thời gian thực hiện.",
    icon: Briefcase,
    content: `# Đề xuất Mở rộng Thương hiệu Cà phê Artisan Roasters

## Tóm tắt Dự án
Artisan Coffee Roasters đang tìm cách mở rộng quy mô hoạt động để đáp ứng nhu cầu cao tại các trung tâm đô thị sầm uất. Chúng tôi đề xuất khai trương ba quán cà phê trải nghiệm kiểu mẫu kết hợp với nền tảng thương mại điện tử đăng ký thành viên tự động.

## Phân tích Thị trường
Dữ liệu khảo sát của chúng tôi cho thấy lượng tiêu thụ hạt cà phê cao cấp đã tăng 18% so với cùng kỳ năm ngoái trong phân khúc khách hàng mục tiêu.
- 72% ưa chuộng các loại hạt cà phê hữu cơ đơn nguồn gốc (single-origin)
- 45% mua cà phê specialty ít nhất hai lần mỗi ngày
- 81% thích các chương trình ưu đãi thành viên tích hợp trên di động

## Cột mốc Dự án
| Cột mốc | Thời gian | Kết quả bàn giao |
|---|---|---|
| Thuê mặt bằng | Tháng 1-2 | Ký hợp đồng thuê tại 3 địa điểm bán lẻ |
| Thiết kế & Thi công | Tháng 3-5 | Lắp đặt quầy espresso tùy chỉnh và hoàn thiện nội thất |
| Chiến dịch Khai trương | Tháng 6 | Lễ khai trương và thu hút người dùng đăng ký |

> Mô hình đăng ký thành viên của chúng tôi mang lại nguồn doanh thu định kỳ có thể dự đoán được với giá trị trọn đời (LTV) ước tính là $360 trên mỗi khách hàng.

## Dự phóng Tài chính
Chúng tôi dự kiến thời gian hòa vốn trong vòng 14 tháng kể từ ngày khai trương các quán bán lẻ.
`
  },
  {
    title: "Ghi chú Kỹ thuật / Lập trình 💻",
    description: "Soạn thảo ghi chú, kế hoạch hành động và đoạn mã lập trình mẫu.",
    icon: FileCode,
    content: `# Ghi chú: Các quy tắc làm việc tập trung (Deep Work)

## Luận điểm chính
Deep work là khả năng tập trung cao độ không bị phân tâm vào một nhiệm vụ đòi hỏi nhiều tư duy nhận thức. Đây là kỹ năng giúp bạn nhanh chóng nắm bắt thông tin phức tạp và đạt kết quả tốt hơn trong thời gian ngắn hơn.

## Ba Quy tắc Tập trung
1. **Lập lịch cho sự xao nhãng**: Giới hạn việc sử dụng internet và các công cụ liên lạc vào các khoảng thời gian được định nghĩa sẵn.
2. **Chấp nhận sự nhàm chán**: Thực hành việc ngồi yên lặng mà không kiểm tra thiết bị để rèn luyện lại khả năng chú ý.
3. **Nghi thức hóa không gian làm việc**: Thiết lập ranh giới vật lý sạch sẽ dành riêng cho các tác vụ cần tập trung cao độ.

> "Để sản xuất ở mức hiệu suất cao nhất, bạn cần làm việc trong thời gian dài với sự tập trung tối đa vào một nhiệm vụ duy nhất mà không bị phân tâm." — Cal Newport

## Danh sách công việc hàng ngày
- Buổi sáng: 90 phút tập trung viết mã nguồn cốt lõi (Core Code)
- Giữa ngày: Xem xét các pull request và phản hồi kiến trúc hệ thống
- Buổi chiều: Phản hồi email và xử lý công việc hành chính nhẹ nhàng

## Quy trình làm việc
\`\`\`typescript
async function thucHienDeepWork() {
  await tatThongBao();
  await kichHoatTrangThaiTapTrung();
  while (dangTapTrung) {
    vietCodeTinhTe();
  }
}
\`\`\`
`
  }
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectTemplate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center px-4 py-8"
    >
      <motion.div
        variants={itemVariants}
        className="w-16 h-16 bg-accent-yellow border-4 border-ink-border flex items-center justify-center text-ink-black shadow-[4px_4px_0px_var(--shadow-color)] mb-6 rotate-3"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="text-2xl md:text-3xl font-heading font-black text-ink-black tracking-tight mb-3"
      >
        Soạn thảo dễ dàng ✍️
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="text-xs font-mono font-bold text-ink-light mb-6 max-w-md leading-relaxed"
      >
        Dán văn bản thô hoặc Markdown, hoặc kéo thả tệp tin để bắt đầu. Hệ thống sẽ tự động phân tích định dạng, áp dụng giao diện và tạo tài liệu Word chuyên nghiệp.
      </motion.p>

      <motion.button
        variants={itemVariants}
        onClick={() => onSelectTemplate("# Tiêu đề tài liệu\n\nNhập hoặc dán nội dung của bạn tại đây...")}
        className="mb-8 px-6 py-3 border-2 border-ink-border bg-accent-blue text-white font-mono font-bold text-sm shadow-[4px_4px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer transition-all duration-100"
      >
        Bắt đầu trang trống 📄
      </motion.button>

      <motion.div variants={itemVariants} className="w-full text-left">
        <h3 className="text-xs font-mono font-bold text-ink-black tracking-wider uppercase mb-4 pl-1">
          Hoặc bắt đầu bằng tài liệu mẫu 👇
        </h3>
        <div className="grid gap-4 w-full">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <button
                key={tpl.title}
                onClick={() => onSelectTemplate(tpl.content)}
                className={`flex items-start p-3.5 border-2 border-ink-border bg-white cursor-pointer shadow-[3px_3px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 text-left w-full group`}
              >
                <div className="p-2 border-2 border-ink-border bg-[#FAF9F5] text-ink-black mr-4 shrink-0 shadow-[1px_1px_0px_var(--shadow-color)]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-mono font-bold text-xs text-ink-black">
                    {tpl.title}
                  </h4>
                  <p className="text-[10px] font-mono text-ink-light mt-1 line-clamp-1 leading-normal">
                    {tpl.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
export default EmptyState;

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">VolunteerHub</h3>
            <p className="text-neutral-400">Kết nối - Cống hiến - Lan tỏa</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#" className="hover:text-white">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Sự kiện
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Về chúng tôi
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#" className="hover:text-white">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Điều khoản
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Theo dõi</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#" className="hover:text-white">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-700 pt-8 text-center text-neutral-400">
          <p>&copy; 2025 VolunteerHub. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <p className="text-muted text-lg">Đang tải sự kiện...</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

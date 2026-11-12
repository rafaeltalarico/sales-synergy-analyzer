import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-synergy-light">
      <Sidebar />
      <div className="md:ml-56">
        <main className="pt-14 md:pt-0 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
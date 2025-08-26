import { useEffect, useState } from "react";

const QuickSightEmbed = () => {
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    const fetchEmbedUrl = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/embed-url`);
      const data = await res.json();
      setEmbedUrl(data.url);
    };
    fetchEmbedUrl();
  }, []);

  if (!embedUrl) return <p>Carregando painel...</p>;

  return (
    <div className="w-full h-screen overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        style={{ 
          border: "none",
          display: "block",
          width: "100%",
          height: "100vh"
        }}
        allowFullScreen
      />
    </div>    
  );
};

export default QuickSightEmbed;

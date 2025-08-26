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
    <div className="w-screen min-h-screen">
      <iframe
        title="Painel de BI"
        src={embedUrl}
        className="w-full min-h-screen"
        style={{ border: "none" }}
        allowFullScreen
      />
    </div>    
  );
};

export default QuickSightEmbed;

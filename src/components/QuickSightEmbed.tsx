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
    <iframe
      title="Painel de BI"
      src={embedUrl}
      style={{
        width: "100%",
        height: "calc(100vh - 64px)",
        border: "none",
      }}
      allowFullScreen
    />
  );
};

export default QuickSightEmbed;

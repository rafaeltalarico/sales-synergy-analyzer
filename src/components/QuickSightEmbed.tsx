import { useEffect, useState } from "react";
import "../QuickSightEmbed.css";

const QuickSightEmbed = () => {
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    const fetchEmbedUrl = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/embed-url`);
      const data = await res.json();
      setEmbedUrl(data.url);
    };
    fetchEmbedUrl();

    document.body.classList.add('quicksight-page');

    return () => {
      document.body.classList.remove('quicksight-page');
    };
  }, []);

  if (!embedUrl) return <p>Carregando painel...</p>;

  return (
    <div className="quicksight-container">
      <iframe
        src={embedUrl}
        className="quicksight-iframe"
        style={{ border: "none" }}
        allowFullScreen
      />
    </div>      
  );
};

export default QuickSightEmbed;

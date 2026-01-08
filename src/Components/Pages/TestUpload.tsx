import { useEffect, useState } from "react";
import { presignedUploadS3 } from "../../api/s3upload";

export const TestUpload = () => {
  const src = "https://i.imgur.com/jlFgGpe.jpg";
  const [isReady, setIsReady] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob>();

  useEffect(() => {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        setImageBlob(blob);
        setIsReady(true);
      });
  }, []);

  const uploadImage = () => {
    if (!imageBlob) return;
    presignedUploadS3("tests/upload1.jpg", imageBlob);
  };

  return (
    <div>
      <button onClick={uploadImage} disabled={!isReady}>
        upload image
      </button>
    </div>
  );
};

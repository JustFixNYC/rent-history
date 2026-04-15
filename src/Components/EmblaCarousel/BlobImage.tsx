import { Trans } from "@lingui/react/macro";
import React, { useState, useEffect, ReactNode } from "react";

const BlobImage: React.FC<{ blobData: Blob; alt: string }> = ({
  blobData,
  alt,
}): ReactNode => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (blobData) {
      // Create a URL for the blob data
      const url = URL.createObjectURL(blobData);
      setImageUrl(url);

      // Cleanup function to revoke the object URL when the component unmounts
      // or when blobData changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [blobData]); // Dependency array ensures effect runs when blobData changes

  return (
    <div>
      {imageUrl ? (
        <img src={imageUrl} alt={alt} style={{ maxWidth: "100%" }} />
      ) : (
        <p>
          <Trans>Loading image...</Trans>
        </p>
      )}
    </div>
  );
};

export default BlobImage;

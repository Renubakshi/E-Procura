import { useState } from "react";
import { generateKeyPair, downloadFile } from "../../utils/keyUtils";

export default function GenerateKey() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    const { publicKeyPem, privateKeyPem } = await generateKeyPair();

    console.log("🟡 Sending to backend:");
  console.log({
    email: localStorage.getItem("signupEmail"),
    publicKey: publicKeyPem,
  });
     // 🟢 Save public key to backend
  await fetch("/api/save-public-key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: localStorage.getItem("signupEmail"),   // <--- ye email store hona chahiye
      publicKey: publicKeyPem,
    }),
  });

    // TODO: POST public key to backend
    console.log("Public Key:", publicKeyPem);

    // Download private key
    downloadFile("private-key.pem", privateKeyPem);

    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--primary)] text-white p-4 sm:p-6">
      <div className="bg-[var(--primaryAccent)] p-6 sm:p-8 md:p-10 rounded-xl w-full max-w-[450px] shadow-xl">

        {!success ? (
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Generate Your Key Pair</h1>
            <p className="mb-6 text-[var(--light)]">
              Your account is almost ready.  
              Click the button below to generate your secure keys.
            </p>

            <button
              onClick={handleGenerate}
              className="w-full bg-[var(--soft)] p-3 rounded font-bold text-black hover:bg-[var(--light)]"
            >
              {loading ? "Generating..." : "Generate Key Pair"}
            </button>
          </>
        ) : (
          <>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3">Keys Generated Successfully 🎉</h1>
            <p className="text-[var(--light)] mb-6">
              Your public key is saved, and private key has been downloaded.
            </p>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-[var(--soft)] p-3 rounded text-black font-bold hover:bg-[var(--light)]"
            >
              Login with your Credential.
            </button>
          </>
        )}
      </div>
    </div>
  );
}

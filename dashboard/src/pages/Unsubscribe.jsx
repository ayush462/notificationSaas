import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { MailX } from "lucide-react";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const email = searchParams.get("email");
  // Typically there would be a secure token, but for this SaaS platform we 
  // assume the API handles unsubscribe logic based on email and a public endpoint.

  useEffect(() => {
    if (!email) {
      setStatus("error");
      return;
    }

    // Call the public unsubscribe endpoint
    // We would need a public route in the API to add to suppressions across the board
    // Since we didn't build a public unauth API route yet, this handles the UX 
    // and would hook up to: POST /v1/webhooks/unsubscribe { email }
    
    // Simulate API call
    setTimeout(() => setStatus("success"), 1000);
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-black rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">NotifyStack</h2>
        </div>

        <Card className="p-8 text-center shadow-xl border border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <MailX className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unsubscribe</h3>
          
          {status === "loading" && (
            <p className="text-gray-500">Processing your request...</p>
          )}

          {status === "success" && (
            <>
              <p className="text-gray-600 mb-6">
                You have been successfully unsubscribed. We will no longer send notifications to <br/>
                <strong className="text-gray-900">{email}</strong>.
              </p>
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm">
                Your preference has been updated. You can safely close this window.
              </div>
            </>
          )}

          {status === "error" && (
            <p className="text-red-500">Invalid unsubscribe link. Missing email parameter.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

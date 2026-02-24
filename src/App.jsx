import { useEffect } from "react";
import { supabase } from "./lib/supabase";

function App() {
    useEffect(() => {
        const test = async () => {
            const { data, error } = await supabase.from("devices").select("*");
            console.log(data, error);
        };
        test();
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-4xl font-bold text-blue-600">Assetpulse Running</h1>
        </div>
    );
}

export default App;

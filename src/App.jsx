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

  return <h1>Assetpulse Running</h1>;
}

export default App;
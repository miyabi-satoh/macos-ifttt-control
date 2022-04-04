import { useEffect, useState } from "react";
import { Install } from "../components/Install";
import Layout from "../components/Layout";
import { Config } from "../interfaces";

const IndexPage = () => {
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const f = async () => {
      setConfig(await window.api.getConfig());
      setTitle(await window.api.getAppName());
    };
    f();
  }, []);

  if (config === undefined) {
    return null;
  }

  return (
    <Layout title={title}>
      <Install />
    </Layout>
  );
};

export default IndexPage;

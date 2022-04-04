import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { Config } from "../interfaces";

const IndexPage = () => {
  const [config, setConfig] = useState<Config | undefined>(undefined);

  const onSayHiClick = async () => {
    const message = await window.api.message("hi from next");
    alert(message);
  };

  useEffect(() => {
    const f = async () => {
      setConfig(await window.api.getConfig());
    };
    f();

    // add a listener to 'message' channel
    // global.ipcRenderer.addListener('message', (_event, args) => {
    //   alert(args)
    // })
  }, []);

  if (config === undefined) {
    return null;
  }

  return (
    <Layout title="Home | Next.js + TypeScript + Electron Example">
      <p>{`Hash: ${config.hash}`}</p>
      {/* <h1>Hello Next.js 👋</h1>
      <button onClick={onSayHiClick}>Say hi to electron</button>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p> */}
    </Layout>
  );
};

export default IndexPage;

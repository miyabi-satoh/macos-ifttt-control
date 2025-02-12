import React, { ReactNode } from "react";
import Head from "next/head";

type Props = {
  children: ReactNode;
  title?: string;
};

const Layout: React.VFC<Props> = ({ children, title }) => {
  return (
    <div>
      <Head>
        {title && <title>{title}</title>}
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {children}
    </div>
  );
};

export default Layout;

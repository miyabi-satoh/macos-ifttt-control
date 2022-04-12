import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/Layout";

const ViewPage = () => {
  const router = useRouter();
  const { log } = router.query;

  return (
    <Layout>
      <div className="p-4">
        <div>ViewPage:{log}</div>
      </div>
    </Layout>
  );
};

export default ViewPage;

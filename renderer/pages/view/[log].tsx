import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Button, Container, Stack } from "react-bootstrap";
import { FaChevronLeft } from "react-icons/fa";
import Layout from "../../components/Layout";

const ViewPage = () => {
  const router = useRouter();
  const { log } = router.query;

  const [logContents, setLogContents] = useState<string>("");

  const handleBack = () => {
    window.location.href = "/";
  };

  const readLog = async () => {
    const path = await window.api.getResourcePath(`cli/${log}.log`);
    const res = await window.api.readFile(path);
    // Save empty webhook triggers
    const logs = res.status ? res.stderr : res.stdout;
    console.log(path, res);

    setLogContents(logs);
  };

  useEffect(() => {
    readLog();
  }, []);

  return (
    <Layout>
      <div className="d-flex flex-column vh-100">
        <div className="bg-secondary text-white p-3">
          <Stack direction="horizontal" gap={3}>
            <Button variant="info" className="text-white" onClick={handleBack}>
              <FaChevronLeft /> Back
            </Button>
            <h4 className="mb-0">{log}.log</h4>
          </Stack>
        </div>
        <pre className="flex-grow-1 p-3 text-body">{logContents}</pre>
      </div>
    </Layout>
  );
};

export default ViewPage;

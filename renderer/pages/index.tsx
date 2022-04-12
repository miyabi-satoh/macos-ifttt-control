import React, { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, Form, Modal, Stack } from "react-bootstrap";
import Layout from "../components/Layout";
import {
  FaBook,
  FaCheckCircle,
  FaCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPlus,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import dynamic from "next/dynamic";
import { WebhookDialog, WebhookProps } from "../components/WebhookDialog";
import { EventDialog, EventProps } from "../components/EventDialog";
import { LinkForm, LinkProps } from "../components/LinkForm";

const url_wiki = "https://github.com/miyabi-satoh/macos-ifttt-control/wiki";
const mic_config_json = ".mic_config.json";
const mic_triggers_json = ".mic_triggers.json";
const mic_events_json = ".mic_events.json";
const icons_json = "/json/icons.json";
const agent_name = "com.amiiby.macosiftttcontrol-agent";
const plist_file = `${agent_name}.plist`;
const plist_path = `cli/${plist_file}`;
const launchagents_path = `Library/LaunchAgents/${plist_file}`;

/**
 * Validates a given URL
 */
function validateUrl(url: string) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  return !!pattern.test(url);
}

type Config = {
  publicLink: string;
};

type ModalType = "" | "Trigger" | "Event" | "Alert";
type AlertType = "" | "success" | "danger" | "info";
type AgentStatus = "" | "unloaded" | "running" | "error";

const IndexPage = () => {
  const configDefault: string = useMemo(() => {
    const data: Config = {
      publicLink: "",
    };
    return JSON.stringify(data);
  }, []);

  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [triggers, setTriggers] = useState<WebhookProps[]>([]);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [icons, setIcons] = useState<string[]>([]);
  const [modalName, setModalName] = useState<ModalType>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string[]>([]);
  const [alertType, setAlertType] = useState<AlertType>("");
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("");
  const [pythonPath, setPythonPath] = useState<string>("");
  const [pythonV, setPythonV] = useState<string>("");
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const alertTextClass = useMemo(() => {
    if (alertType == "danger") {
      return "text-danger";
    }
    return "text-info";
  }, [alertType]);

  const alertIcon = useMemo(() => {
    if (alertType == "success") {
      return <FaCheckCircle />;
    }
    if (alertType == "danger") {
      return <FaTimesCircle />;
    }
    return <FaInfoCircle />;
  }, [alertType]);

  const agentStatusColor = useMemo(() => {
    if (agentStatus == "error") {
      return "warning";
    }
    if (agentStatus == "running") {
      return "success";
    }
    return "danger";
  }, [agentStatus]);

  const triggerIcons = useMemo(() => {
    return triggers.map((trigger) => {
      return trigger.icon
        ? dynamic(() =>
            import("react-icons/fa").then((mod: any) => mod[trigger.icon[0]])
          )
        : null;
    });
  }, [triggers]);

  const handleAddWebhook = async (data: WebhookProps) => {
    if (!data.title) {
      alert("The Webhook Title can't be empty.");
      return;
    }

    if (!data.url) {
      alert("The Webhook URL can't be empty.");
      return;
    }

    if (!validateUrl(data.url)) {
      alert("The entered Webhook URL it's invalid.");
      return;
    }

    const newTriggers = [...triggers, data];
    const json = JSON.stringify(newTriggers);

    const path = await window.api.getHomePath(mic_triggers_json);
    const res = await window.api.writeFile(path, json);
    if (res.status) {
      alert(res.stderr);
      return;
    }

    handleCloseModal();
    setTriggers(newTriggers);
  };

  const handleDeleteWebhook = async (id: number) => {
    const newTriggers = [...triggers];
    newTriggers.splice(id, 1);
    const json = JSON.stringify(newTriggers);

    const path = await window.api.getHomePath(mic_triggers_json);
    const res = await window.api.writeFile(path, json);
    if (res.status) {
      alert(res.stderr);
      return;
    }

    setTriggers(newTriggers);
  };

  const handleRunWebhook = async (url: string) => {
    const res = await window.api.runWebhook(url);
    // console.log(res);
    if (res.status === 0) {
      setAlertTitle("Webhook Triggered");
      setAlertMessage([
        "The Webhook has been triggered succesfully.",
        res.stdout,
      ]);
      setAlertType("success");
    } else {
      setAlertTitle("Webhook can't be Triggered");
      setAlertMessage([
        "The Webhook can't been triggered at the moment. Try again later.",
        res.stderr,
      ]);
      setAlertType("danger");
    }
    setModalName("Alert");
  };

  const handleAddEvent = async (data: EventProps) => {
    if (data.trigger == "") {
      alert("The Event Command can't be empty.");
      return;
    }

    if (data.url == "") {
      alert("The Event URL can't be empty.");
      return;
    }

    if (!validateUrl(data.url)) {
      alert("The entered Event URL it's invalid.");
      return;
    }

    const newEvents = [...events, data];
    const json = JSON.stringify(newEvents);

    const path = await window.api.getHomePath(mic_events_json);
    const res = await window.api.writeFile(path, json);
    if (res.status) {
      alert(res.stderr);
      return;
    }

    handleCloseModal();
    setEvents(newEvents);
  };

  const handleDeleteEvent = async (id: number) => {
    const newEvents = [...events];
    newEvents.splice(id, 1);
    const json = JSON.stringify(newEvents);

    const path = await window.api.getHomePath(mic_events_json);
    const res = await window.api.writeFile(path, json);
    if (res.status) {
      alert(res.stderr);
      return;
    }

    setEvents(newEvents);
  };

  const handleShowModal = (name: ModalType) => {
    setModalName(name);
  };

  const handleCloseModal = () => {
    setModalName("");
  };

  const handleSaveLink = async (data: LinkProps) => {
    const dropbox_url = data.publicLink;
    if (!validateUrl(dropbox_url) || !dropbox_url.includes("dropbox.com")) {
      alert("The entered Dropbox URL it's invalid.");
      return false;
    }

    const json = JSON.stringify(data);
    const path = await window.api.getHomePath(mic_config_json);
    const res = await window.api.writeFile(path, json);
    if (res.status) {
      alert(res.stderr);
      return false;
    }

    setConfig({ ...config, ...data });
    return true;
  };

  const handleAgentStart = async () => {
    // plistファイルを読み込む
    let path = await window.api.getResourcePath(plist_path);
    let res = await window.api.readFile(path);
    if (res.status) {
      alert(res.stderr);
      return;
    }
    // 変数を置換して書き込む
    const resourcePath = await window.api.getResourcePath("");
    const plistData = res.stdout
      .replaceAll("%PATH%", resourcePath)
      .replaceAll("%PYTHONPATH%", pythonPath);
    path = await window.api.getHomePath(launchagents_path);

    res = await window.api.writeFile(path, plistData);
    if (res.status) {
      alert(res.stderr);
      return;
    }

    // launchctlを実行する
    await window.api.exec(`xattr -c "${path}"`);
    res = await window.api.exec(`launchctl load -w "${path}"`);
    // console.log(res);
  };

  const handleAgentStop = async () => {
    const path = await window.api.getHomePath(launchagents_path);
    await window.api.exec(`xattr -c "${path}"`);
    const res = await window.api.exec(`launchctl unload "${path}"`);
    // console.log(res);
  };

  const handleAgentAction = async () => {
    setIsBusy(true);
    if (agentStatus == "unloaded") {
      await handleAgentStart();
    } else if (agentStatus == "running") {
      await handleAgentStop();
    }
    await watchAgent();
    setIsBusy(false);
  };

  const watchAgent = async () => {
    // console.log("watchAgent", debugInfo);
    // pythonがインストールされているかチェック
    let res = await window.api.exec("which python3");
    if (res.status) {
      res = await window.api.exec("which python");
      if (res.status) {
        setAgentStatus("error");
        return;
      }
    }
    const python = res.stdout.trim();
    res = await window.api.exec(`${python} -V`);
    if (res.status) {
      setAgentStatus("error");
      return;
    }

    // Check python 3.7 or later
    const pyVersion = res.stdout.trim();
    const pyVersionNumbers = pyVersion
      .replace("Python ", "")
      .split(".")
      .map((s) => Number(s));
    if (pyVersionNumbers[0] < 3) {
      setAgentStatus("error");
      return;
    }
    if (pyVersionNumbers[0] == 3 && pyVersionNumbers[1] < 7) {
      setAgentStatus("error");
      return;
    }

    setPythonV(pyVersion);
    setPythonPath(python);

    // Agentがloadされているかチェック
    res = await window.api.exec(`launchctl list | grep ${agent_name}`);

    // const newInfo = [
    //   `status = ${res.status}`,
    //   `stdout = ${res.stdout}`,
    //   `stderr = ${res.stderr}`,
    // ];
    // setDebugInfo(debugInfo.concat(newInfo));

    if (res.status) {
      setAgentStatus("unloaded");
    } else {
      setAgentStatus("running");
    }
  };

  useEffect(() => {
    const f = async () => {
      // Get window title
      setTitle(await window.api.getAppName());

      // Get webhook triggers
      {
        const path = await window.api.getHomePath(mic_triggers_json);
        const res = await window.api.readFile(path);
        const json = JSON.parse(res.stdout || "[]");
        // Save empty webhook triggers
        if (!res.status && !res.stdout) {
          await window.api.writeFile(path, JSON.stringify(json));
        }
        setTriggers(json);
      }

      // Get webhook events
      {
        const path = await window.api.getHomePath(mic_events_json);
        const res = await window.api.readFile(path);
        const json = JSON.parse(res.stdout || "[]");
        // Save empty webhook events
        if (!res.status && !res.stdout) {
          await window.api.writeFile(path, JSON.stringify(json));
        }
        setEvents(json);
      }

      // Get icons
      {
        const path = await window.api.getResourcePath(icons_json);
        const res = await window.api.readFile(path);
        const json = JSON.parse(res.stdout || "[]");
        const reactIcons = json.map((data: string[]) => {
          const name = data[2] || data[0];
          return (
            (data[1] == "far" ? "FaReg" : "Fa") +
            name
              .replace(/^[a-z]/, (match) => match.toUpperCase())
              .replace(/-([a-z])/g, (_match, p1) => p1.toUpperCase())
              .replace(
                /(\d)([a-z])/g,
                (_match, p1, p2) => p1 + p2.toUpperCase()
              )
          );
        });
        setIcons(reactIcons);
      }
      // TODO: Check Update

      // Watch agent
      await watchAgent();

      // Get config (and go rendering)
      {
        const path = await window.api.getHomePath(mic_config_json);
        const res = await window.api.readFile(path);
        const json = JSON.parse(res.stdout || configDefault);
        setConfig(json);
      }
    };

    f();

    const intervalId = setInterval(async () => {
      if (!isBusy) {
        await watchAgent();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (config === undefined) {
    return null;
  }

  return (
    <Layout title={title}>
      <div className="p-4">
        <div id="webhooks">
          <h6 className="pb-2 text-muted">
            <small>Trigger a Webhook-based Applet:</small>
          </h6>
          <div className="row px-2">
            {triggers.length > 0 ? (
              triggers.map((element, id) => {
                // const icon = element.icon ? element.icon[0] : undefined;
                // const IconComponent = icon
                //   ? dynamic(() =>
                //       import("react-icons/fa").then((mod: any) => mod[icon])
                //     )
                //   : null;
                const IconComponent = triggerIcons[id];
                return (
                  <div
                    key={`webhook_${id}`}
                    className="col-3 col-md-2 col-lg-1"
                    style={{ position: "relative" }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="delete-webhook"
                      onClick={() => handleDeleteWebhook(id)}
                    >
                      <FaTimes />
                    </Button>
                    <Button
                      size="sm"
                      variant={element.color}
                      className="text-white w-100 trigger-webhook"
                      onClick={() => handleRunWebhook(element.url)}
                    >
                      <IconContext.Provider value={{ className: "fs-lg my-2" }}>
                        {IconComponent ? (
                          <IconComponent />
                        ) : (
                          <div style={{ height: "25px" }} />
                        )}
                      </IconContext.Provider>
                      <br />
                      {element.title}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="bg-info text-white shadow rounded px-4 py-3">
                There are no Webhook Triggers added yet. Why don't you add one
                right now?
              </div>
            )}
          </div>
        </div>

        <div id="events" className="pt-4">
          <h6 className="pb-2 text-muted">
            <small>Manage Webhook Events:</small>
          </h6>
          <div className="row px-3">
            {events.length > 0 ? (
              events.map((element, id) => {
                const color = element.trigger.includes("auto-")
                  ? "success"
                  : "info";

                return (
                  <div key={`event_${id}`} className="col-12 pb-2">
                    <ButtonGroup>
                      <Button
                        variant="light"
                        className={`w-75 text-start border-${color} text-break`}
                        style={{ textTransform: "none" }}
                      >
                        {element.url}
                      </Button>
                      <Button variant={color} className={`w-25`} disabled>
                        {element.trigger}
                      </Button>
                      <Button
                        variant="secondary"
                        className="delete-event"
                        onClick={() => handleDeleteEvent(id)}
                      >
                        <FaTimes />
                      </Button>
                    </ButtonGroup>
                  </div>
                );
              })
            ) : (
              <div className="bg-info text-white shadow rounded px-4 py-3">
                There are no Webhook Events added yet. Why don't you add one
                right now?
              </div>
            )}
          </div>
        </div>

        <div className="pt-4">
          <h6 className="pb-2 text-muted">
            <small>Options:</small>
          </h6>
          <div className="row">
            <div className="col-12 col-sm-6 pb-1 d-grid">
              <Button
                variant="info"
                size="sm"
                className="text-white"
                onClick={() => handleShowModal("Trigger")}
              >
                <FaPlus /> Add Webhook Trigger
              </Button>
            </div>
            <WebhookDialog
              show={modalName == "Trigger"}
              onHide={handleCloseModal}
              icons={icons}
              onSubmit={handleAddWebhook}
            />

            <div className="col-12 col-sm-6 pb-1 d-grid">
              <Button
                variant="info"
                size="sm"
                onClick={() => handleShowModal("Event")}
                className="text-white"
              >
                <FaPlus /> Add Webhook Event
              </Button>
            </div>
            <EventDialog
              onSubmit={handleAddEvent}
              onHide={handleCloseModal}
              show={modalName == "Event"}
            />
          </div>
        </div>

        <div className="pt-4">
          <LinkForm
            defaultValues={{ publicLink: config.publicLink }}
            onSubmit={handleSaveLink}
          />
          <Form.Text muted>
            {!config.publicLink && (
              <>Once you set the link, you can take action via the file.</>
            )}
            {config.publicLink && agentStatus == "error" && (
              <>
                <IconContext.Provider
                  value={{ className: `text-warning me-1` }}
                >
                  <FaExclamationTriangle />
                </IconContext.Provider>
                Python 3.7 or later is not found. It is required to run the
                Agent.
              </>
            )}
            {config.publicLink && agentStatus != "error" && (
              <>
                The Agent uses {pythonPath} ({pythonV}) .
              </>
            )}
          </Form.Text>
          {agentStatus != "error" && config.publicLink && (
            <Stack direction="horizontal" gap={1} className="pt-2">
              <IconContext.Provider
                value={{ className: `text-${agentStatusColor}` }}
              >
                <FaCircle />
              </IconContext.Provider>
              <div>Agent is {agentStatus}.</div>
              <Button
                variant="danger"
                size="sm"
                disabled={isBusy}
                onClick={isBusy ? null : handleAgentAction}
              >
                {agentStatus == "running" ? "Stop" : "Start"}
              </Button>
            </Stack>
          )}
        </div>

        <Stack direction="horizontal">
          <Button
            variant="link"
            className="text-muted fw-light ms-auto p-0"
            style={{ textTransform: "none" }}
            onClick={() => {
              window.api.exec(`open ${url_wiki}`);
            }}
          >
            <IconContext.Provider value={{ className: "me-1" }}>
              <FaBook />
            </IconContext.Provider>
            Documentation
          </Button>
        </Stack>

        {debugInfo.map((info, id) => (
          <div key={id}>{info}</div>
        ))}

        <Modal show={modalName == "Alert"} onHide={handleCloseModal}>
          <Modal.Body>
            <div className="pb-4">
              <h1 className={`${alertTextClass} pb-2 text-center`}>
                {alertIcon}
              </h1>
              <h4 className={alertTextClass}>{alertTitle}</h4>
              <div className="text-dark pt-2 text-break lh-sm">
                {alertMessage.map((message, id) => {
                  return <p key={id}>{message}</p>;
                })}
              </div>
            </div>
            <Button variant="secondary" onClick={handleCloseModal}>
              <FaTimes />
              Close
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </Layout>
  );
};

export default IndexPage;

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import Layout from "../components/Layout";
import { Config } from "../interfaces";
import {
  FaBook,
  FaCheck,
  FaCheckCircle,
  FaInfoCircle,
  FaPlus,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import dynamic from "next/dynamic";

const config_file = ".mic_config.json";
const triggers_file = ".mic_triggers.json";
const icons_file = "/json/icons.json";

type OptionProps = {
  value: string;
  text?: string;
};

const colors = [
  { value: "info", text: "Cyan" },
  { value: "primary", text: "Blue" },
  { value: "success", text: "Green" },
  { value: "warning", text: "Yellow" },
  { value: "danger", text: "Red" },
  { value: "dark", text: "Gray" },
] as const;

const eventTriggers = [
  { value: "", text: "Automatic Trigger" },
  { value: "auto-battery", text: "Battery drops below 20%" },
  { value: "auto-bluetooth-off", text: "Bluetooth is turned off" },
  { value: "auto-bluetooth-on", text: "Bluetooth is turned on" },
  { value: "" },
  { value: "", text: "macOS IFTTT Events" },
  { value: "automator" },
  { value: "ifttt" },
  { value: "ifttt", text: "macrodroid" },
  { value: "ifttt", text: "webhook" },
  { value: "bluetooth" },
  { value: "dir" },
  { value: "disk" },
  { value: "display" },
  { value: "dns" },
  { value: "dock" },
  { value: "finder" },
  { value: "firewall" },
  { value: "flightmode" },
  { value: "gatekeeper" },
  { value: "hostname" },
  { value: "info" },
  { value: "itunes" },
  { value: "lock" },
  { value: "ntp" },
  { value: "printer" },
  { value: "network" },
  { value: "nosleep" },
  { value: "notification" },
  { value: "restart" },
  { value: "safeboot" },
  { value: "screensaver" },
  { value: "service" },
  { value: "shutdown" },
  { value: "sleep" },
  { value: "timezone" },
  { value: "touchbar" },
  { value: "trash" },
  { value: "update" },
  { value: "user" },
  { value: "volume" },
  { value: "vpn" },
  { value: "wallpaper" },
  { value: "wifi" },
  { value: "download" },
  { value: "notificationcenter" },
  { value: "open" },
  { value: "say" },
] as const;

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

type WebhookProps = {
  url: string;
  icon: string[];
  color: string;
  title: string;
};

type ModalType = "" | "Trigger" | "Event" | "Alert";
type AlertType = "" | "success" | "danger" | "info";

const IndexPage = () => {
  const webhookPropsDefault = useMemo(() => {
    const data: WebhookProps = {
      url: "",
      icon: [],
      color: "info",
      title: "",
    };
    return data;
  }, []);

  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [triggers, setTriggers] = useState<WebhookProps[]>([]);
  const [events, setEvents] = useState([]);
  const [icons, setIcons] = useState<string[]>([]);
  const [modalName, setModalName] = useState<ModalType>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string[]>([]);
  const [alertType, setAlertType] = useState<AlertType>("");
  const [webhookProps, setWebhookProps] =
    useState<WebhookProps>(webhookPropsDefault);

  const alertTextClass = useMemo(() => {
    if (alertType == "danger") {
      return "text-danger";
    }
    return "text-info";
  }, [alertType]);

  const alertIcon = useMemo(() => {
    if (alertType == "success") {
      return <FaCheckCircle />;
    } else if (alertType == "danger") {
      return <FaTimesCircle />;
    }
    return <FaInfoCircle />;
  }, [alertType]);

  const handleChangeUrl = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookProps({ ...webhookProps, url: ev.target.value });
  };

  const handleChangeIcon = (val: string[]) => {
    const iconKey = val.slice(-1)[0];
    setWebhookProps({ ...webhookProps, icon: [iconKey] });
  };

  const handleChangeColor = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setWebhookProps({ ...webhookProps, color: ev.target.value });
  };

  const handleChangeTitle = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookProps({ ...webhookProps, title: ev.target.value });
  };

  const handleAddWebhook = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    if (!webhookProps.title) {
      alert("The Webhook Title can't be empty.");
      return;
    }

    if (!webhookProps.url) {
      alert("The Webhook URL can't be empty.");
      return;
    }

    if (!validateUrl(webhookProps.url)) {
      alert("The entered Webhook URL it's invalid.");
      return;
    }

    const newTriggers = [...triggers, webhookProps];
    const json = JSON.stringify(newTriggers);

    const path = await window.api.getConfigPath(triggers_file);
    const res = await window.api.writeFile(path, json);
    if (!res.success) {
      alert(res.message);
    }

    handleCloseModal();
    setTriggers(newTriggers);
  };

  const handleDeleteWebhook = async (id: number) => {
    const newTriggers = [...triggers];
    newTriggers.splice(id, 1);
    const json = JSON.stringify(newTriggers);

    const path = await window.api.getConfigPath(triggers_file);
    const res = await window.api.writeFile(path, json);
    if (!res.success) {
      alert(res.message);
    }

    setTriggers(newTriggers);
  };

  const handleRunWebhook = async (url: string) => {
    const res = await window.api.runWebhook(url);
    // console.log(res);
    if (res.success) {
      setAlertTitle("Webhook Triggered");
      setAlertMessage([
        "The Webhook has been triggered succesfully.",
        res.message,
      ]);
      setAlertType("success");
    } else {
      setAlertTitle("Webhook can't be Triggered");
      setAlertMessage([
        "The Webhook can't been triggered at the moment. Try again later.",
        res.message,
      ]);
      setAlertType("danger");
    }
    setModalName("Alert");
  };

  const handleShowModal = (name: ModalType) => {
    if (name == "Trigger") {
      setWebhookProps({ ...webhookPropsDefault });
    }
    setModalName(name);
  };
  const handleCloseModal = () => {
    setModalName("");
  };

  useEffect(() => {
    const f = async () => {
      // Get window title
      setTitle(await window.api.getAppName());

      // Get config
      {
        const path = await window.api.getConfigPath(config_file);
        const res = await window.api.readFile(path);
        const json = JSON.parse(res.data || "{}");
        setConfig(json);
      }

      // Get webhook triggers
      {
        const path = await window.api.getConfigPath(triggers_file);
        const res = await window.api.readFile(path);
        const json = JSON.parse(res.data || "[]");
        setTriggers(json);
      }

      // Get icons
      {
        const path = await window.api.getResourcePath(icons_file);
        const res = await window.api.readFile(path);
        const json = JSON.parse(res.data || "[]");
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
        // console.log(reactIcons);
        // await window.api.writeFile(path, JSON.stringify(reactIcons));
        setIcons(reactIcons);
      }
      // TODO: Check Update
    };
    f();
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
          <div className="row px-3">
            {triggers.length > 0 ? (
              triggers.map((element, id) => {
                const icon = element.icon ? element.icon[0] : undefined;
                const IconComponent = icon
                  ? dynamic(() =>
                      import("react-icons/fa").then((mod: any) => mod[icon])
                    )
                  : null;
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
                const color = element.command.includes("auto-")
                  ? "success"
                  : "info";

                return (
                  <div key={`event_${id}`} className="col-12 pb-2">
                    <div className="btn-group w-100" role="group">
                      <Button
                        variant="light"
                        className={`btn-block w-75 text-start border border-${color} copy-clipboard`}
                      >
                        {element.url}
                      </Button>
                      <Button variant={color} className={`text-center w-25`}>
                        {element.command}
                      </Button>
                      <Button
                        variant="secondary"
                        className="text-end delete-event"
                        data-event-id={id}
                      >
                        <FaTimes />
                      </Button>
                    </div>
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

        <div id="options" className="pt-4">
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
            <Modal show={modalName == "Trigger"} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Add Webhook</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>Webhook URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Webhook URL"
                    onChange={handleChangeUrl}
                    value={webhookProps.url}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Webhook Icon</Form.Label>
                  <ToggleButtonGroup
                    type="checkbox"
                    name="icons"
                    size="sm"
                    className="flex-wrap overflow-auto w-100 h-px-100"
                    value={webhookProps.icon}
                    onChange={handleChangeIcon}
                  >
                    {icons.map((icon) => {
                      const IconComponent = dynamic(() =>
                        import("react-icons/fa").then((mod: any) => mod[icon])
                      );
                      return (
                        <ToggleButton
                          className="me-2 ms-0 mb-2 flex-grow-0"
                          key={icon}
                          id={icon}
                          value={icon}
                          variant={
                            webhookProps.icon.includes(icon)
                              ? "outline-primary"
                              : "outline-secondary"
                          }
                        >
                          <IconContext.Provider value={{ className: "fs-md" }}>
                            <IconComponent />
                          </IconContext.Provider>
                        </ToggleButton>
                      );
                    })}
                  </ToggleButtonGroup>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Webhook Color</Form.Label>
                  <Form.Select
                    onChange={handleChangeColor}
                    value={webhookProps.color}
                  >
                    {colors.map((color: OptionProps) => {
                      return (
                        <option key={color.value} value={color.value}>
                          {color.text}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Webhook Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Webhook Title"
                    onChange={handleChangeTitle}
                    value={webhookProps.title}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseModal}
                >
                  <FaTimes /> Close
                </Button>
                <Button variant="info" size="sm" onClick={handleAddWebhook}>
                  <FaCheck /> Save changes
                </Button>
              </Modal.Footer>
            </Modal>

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

            <Modal show={modalName == "Event"} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Add Event</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>Event URL</Form.Label>
                  <Form.Control type="text" placeholder="Event URL" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Trigger</Form.Label>
                  <Form.Select>
                    {eventTriggers.map((element: OptionProps, id) => {
                      if (element.value) {
                        return (
                          <option key={`event${id}`} value={element.value}>
                            {element.text || element.value}
                          </option>
                        );
                      } else {
                        return (
                          <option key={`event${id}`} disabled>
                            {element.text || element.value}
                          </option>
                        );
                      }
                    })}
                  </Form.Select>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseModal}
                >
                  <FaTimes /> Close
                </Button>
                <Button variant="info" size="sm" onClick={handleCloseModal}>
                  <FaCheck /> Save changes
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
        <div id="footer" className="py-4 text-muted">
          <div
            id="mac_hash_tooltip"
            className="tooltip bs-tooltip-top"
            onClick={() => "$(this).fadeOut();"}
            role="tooltip"
            style={{ opacity: 1, display: "none" }}
          >
            <div className="arrow ml-2"></div>
            <div className="tooltip-inner bg-secondary shadow fs-sm">
              <FaCheck /> Copied to Clipboard!
            </div>
          </div>
          <small>
            Mac Hash: <i id="mac_hash"></i>
          </small>
          <div className="float-end">
            <a
              href="https://github.com/abdyfranco/macos-ifttt-control/wiki"
              target="_blank"
              className="text-muted fs-sm external-link"
            >
              <IconContext.Provider value={{ className: "mr-1" }}>
                <FaBook />
              </IconContext.Provider>
              Documentation
            </a>
          </div>
        </div>

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

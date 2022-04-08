import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
// import { Install } from "../components/Install";
import Layout from "../components/Layout";
import { Config } from "../interfaces";
import {
  FaBook,
  FaCheck,
  FaPlus,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import { Icons } from "../components/Icons";

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
  { value: "", text: "" },
  { value: "", text: "macOS IFTTT Events" },
  { value: "automator", text: "automator" },
  { value: "ifttt", text: "ifttt" },
  { value: "ifttt", text: "macrodroid" },
  { value: "ifttt", text: "webhook" },
  { value: "bluetooth", text: "bluetooth" },
  { value: "dir", text: "dir" },
  { value: "disk", text: "disk" },
  { value: "display", text: "display" },
  { value: "dns", text: "dns" },
  { value: "dock", text: "dock" },
  { value: "finder", text: "finder" },
  { value: "firewall", text: "firewall" },
  { value: "flightmode", text: "flightmode" },
  { value: "gatekeeper", text: "gatekeeper" },
  { value: "hostname", text: "hostname" },
  { value: "info", text: "info" },
  { value: "itunes", text: "itunes" },
  { value: "lock", text: "lock" },
  { value: "ntp", text: "ntp" },
  { value: "printer", text: "printer" },
  { value: "network", text: "network" },
  { value: "nosleep", text: "nosleep" },
  { value: "notification", text: "notification" },
  { value: "restart", text: "restart" },
  { value: "safeboot", text: "safeboot" },
  { value: "screensaver", text: "screensaver" },
  { value: "service", text: "service" },
  { value: "shutdown", text: "shutdown" },
  { value: "sleep", text: "sleep" },
  { value: "timezone", text: "timezone" },
  { value: "touchbar", text: "touchbar" },
  { value: "trash", text: "trash" },
  { value: "update", text: "update" },
  { value: "user", text: "user" },
  { value: "volume", text: "volume" },
  { value: "vpn", text: "vpn" },
  { value: "wallpaper", text: "wallpaper" },
  { value: "wifi", text: "wifi" },
  { value: "download", text: "download" },
  { value: "notificationcenter", text: "notificationcenter" },
  { value: "open", text: "open" },
  { value: "say", text: "say" },
];

type WebhookProps = {
  url: string;
  icon: string[];
  color: string;
  title: string;
};

const webhookPropsDefault = {
  url: "",
  icon: [],
  color: "",
  title: "",
};

type ModalType = "" | "Trigger" | "Event" | "alert";

const IndexPage = () => {
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [icons, setIcons] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalName, setModalName] = useState<ModalType>("");
  const [webhookProps, setWebhookProps] = useState<WebhookProps>({
    ...webhookPropsDefault,
  });

  const handleChangeUrl = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookProps({ ...webhookProps, url: ev.target.value });
  };

  const handleChangeTitle = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookProps({ ...webhookProps, title: ev.target.value });
  };

  const handleChangeColor = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setWebhookProps({ ...webhookProps, color: ev.target.value });
  };

  const handleAddWebhook = (ev: React.MouseEvent<HTMLButtonElement>) => {
    console.log(webhookProps);
    handleCloseModal();
  };

  const handleShowModal = (name: ModalType) => {
    if (name == "Trigger") {
      setWebhookProps({ ...webhookProps });
    }
    setModalName(name);
  };
  const handleCloseModal = () => {
    setModalName("");
  };

  useEffect(() => {
    const f = async () => {
      setConfig(await window.api.getConfig());
      setTitle(await window.api.getAppName());
      setIcons(await window.api.getIcons());

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
                const TriggerIcon = element.icon;
                return (
                  <div
                    key={`webhook_${id}`}
                    className="col-3 col-md-2 col-lg-1 pb-4"
                  >
                    <div
                      className="btn btn-sm btn-secondary delete-webhook"
                      data-webhook-id={id}
                    >
                      <FaTimes />
                    </div>{" "}
                    <div
                      className={`btn btn-block btn-sm btn-${element.color} trigger-webhook`}
                      data-webhook={element.url}
                    >
                      <IconContext.Provider value={{ className: "fs-lg my-2" }}>
                        <TriggerIcon />
                      </IconContext.Provider>
                      <br />
                      {element.title}
                    </div>
                  </div>
                );
              })
            ) : (
              <div id="webhooks-empty" className="w-100 p-2">
                <div className="bg-info text-white shadow rounded px-4 py-3">
                  There are no Webhook Triggers added yet. Why don't you add one
                  right now?
                </div>
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
                let color = "info";

                if (element.command.includes("auto-")) {
                  color = "success";
                }

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
              <div id="events-empty" className="w-100 p-2">
                <div className="bg-info text-white shadow rounded px-4 py-3">
                  There are no Webhook Events added yet. Why don't you add one
                  right now?
                </div>
              </div>
            )}
          </div>
        </div>

        <div id="options" className="pt-4">
          <h6 className="pb-2 text-muted">
            <small>Options:</small>
          </h6>
          <div className="row">
            <div className="col-12 col-md-6 text-start pb-1 d-grid">
              <Button
                variant="info"
                size="sm"
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
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Webhook Icon</Form.Label>
                  <div id="webhook_icons" className="p-1">
                    {/* Font Awesome icons will be listed here */}
                    <Icons
                      onClick={(iconInfo: string) => {
                        setWebhookProps({
                          ...webhookProps,
                          icon: [iconInfo],
                        });
                      }}
                    />
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Webhook Color</Form.Label>
                  <Form.Select onChange={handleChangeColor}>
                    {colors.map((color) => {
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

            <div className="col-12 col-md-6 text-center pb-1 d-grid">
              <Button
                variant="info"
                size="sm"
                onClick={() => handleShowModal("Event")}
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
                    {eventTriggers.map(({ value, text }, id) => {
                      if (value) {
                        return (
                          <option key={`event${id}`} value={value}>
                            {text}
                          </option>
                        );
                      } else {
                        return (
                          <option key={`event${id}`} disabled>
                            {text}
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
          <div className="float-right">
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

        <Modal show={modalName == "alert"} onHide={handleCloseModal}>
          <Modal.Body>
            <div className="pb-4">
              <h1 id="alert-dialog-icon" className="pb-2 text-center">
                <FaTimesCircle />
              </h1>
              <h4 id="alert-dialog-title"></h4>
              <h6 id="alert-dialog-content" className="text-dark pt-2"></h6>
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

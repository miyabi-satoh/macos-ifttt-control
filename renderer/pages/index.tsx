import { useEffect, useState } from "react";
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

type WebhookProps = {
  url: string;
  icon: string[];
  color: string;
  title: string;
};

const IndexPage = () => {
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [icons, setIcons] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalName, setModalName] = useState("");
  const [webhookProps, setWebhookProps] = useState<WebhookProps>({
    url: "",
    icon: [],
    color: "",
    title: "",
  });

  const handleShowModal = (name: string) => {
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
            <div className="col-12 col-md-4 text-start pb-1 d-grid">
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
                  <Form.Control type="text" placeholder="Webhook URL" />
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
                  <Form.Select>
                    <option value="info">Cyan</option>
                    <option value="primary">Blue</option>
                    <option value="success">Green</option>
                    <option value="warning">Yellow</option>
                    <option value="danger">Red</option>
                    <option value="dark">Gray</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Webhook Title</Form.Label>
                  <Form.Control type="text" placeholder="Webhook Title" />
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

            <div className="col-12 col-md-4 text-center pb-1 d-grid">
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
                    <option disabled>Automatic Trigger</option>
                    <option value="auto-battery">
                      Battery drops below 20%
                    </option>
                    <option value="auto-bluetooth-off">
                      Bluetooth is turned off
                    </option>
                    <option value="auto-bluetooth-on">
                      Bluetooth is turned on
                    </option>
                    <option disabled></option>
                    <option disabled>macOS IFTTT Events</option>
                    <option value="automator">automator</option>
                    <option value="ifttt">ifttt</option>
                    <option value="ifttt">macrodroid</option>
                    <option value="ifttt">webhook</option>
                    <option value="bluetooth">bluetooth</option>
                    <option value="dir">dir</option>
                    <option value="disk">disk</option>
                    <option value="display">display</option>
                    <option value="dns">dns</option>
                    <option value="dock">dock</option>
                    <option value="finder">finder</option>
                    <option value="firewall">firewall</option>
                    <option value="flightmode">flightmode</option>
                    <option value="gatekeeper">gatekeeper</option>
                    <option value="hostname">hostname</option>
                    <option value="info">info</option>
                    <option value="itunes">itunes</option>
                    <option value="lock">lock</option>
                    <option value="ntp">ntp</option>
                    <option value="printer">printer</option>
                    <option value="network">network</option>
                    <option value="nosleep">nosleep</option>
                    <option value="notification">notification</option>
                    <option value="restart">restart</option>
                    <option value="safeboot">safeboot</option>
                    <option value="screensaver">screensaver</option>
                    <option value="service">service</option>
                    <option value="shutdown">shutdown</option>
                    <option value="sleep">sleep</option>
                    <option value="timezone">timezone</option>
                    <option value="touchbar">touchbar</option>
                    <option value="trash">trash</option>
                    <option value="update">update</option>
                    <option value="user">user</option>
                    <option value="volume">volume</option>
                    <option value="vpn">vpn</option>
                    <option value="wallpaper">wallpaper</option>
                    <option value="wifi">wifi</option>
                    <option value="download">download</option>
                    <option value="notificationcenter">
                      notificationcenter
                    </option>
                    <option value="open">open</option>
                    <option value="say">say</option>
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

        <div
          className="modal fade"
          id="alert-dialog"
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-body text-center py-5">
                <div className="pb-4">
                  <h1 id="alert-dialog-icon" className="pb-2 text-center">
                    <FaTimesCircle />
                  </h1>
                  <h4 id="alert-dialog-title"></h4>
                  <h6 id="alert-dialog-content" className="text-dark pt-2"></h6>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  <FaTimes />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;

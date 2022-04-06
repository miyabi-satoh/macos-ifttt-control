import {
  faBook,
  faCheck,
  faPlus,
  faTimes,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
// import { Install } from "../components/Install";
import Layout from "../components/Layout";
import { Config } from "../interfaces";

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
            {/* Webhooks will be listed here */}
            {/* triggers.forEach(function (element, id) {
                $('#webhooks .row').append('<div class="col-3 col-md-2 col-lg-1 pb-4"><div class="btn btn-sm btn-secondary delete-webhook" data-webhook-id="' + id + '"><i class="fas fa-times"></i></div> <div class="btn btn-block btn-sm btn-' + element.color + ' trigger-webhook" data-webhook="' + element.url + '"><i class="' + element.icon + ' fs-lg my-2"></i><br/> ' + element.title + '</div></div>');
            }); */}

            <div
              id="webhooks-empty"
              className="w-100 p-2"
              style={{ display: "none" }}
            >
              <div className="bg-info text-white shadow rounded px-4 py-3">
                There are no Webhook Triggers added yet. Why don't you add one
                right now?
              </div>
            </div>
          </div>
        </div>

        <div id="events" className="pt-4">
          <h6 className="pb-2 text-muted">
            <small>Manage Webhook Events:</small>
          </h6>
          <div className="row px-3">
            {/* Events will be listed here */}

            <div
              id="events-empty"
              className="w-100 p-2"
              style={{ display: "none" }}
            >
              <div className="bg-info text-white shadow rounded px-4 py-3">
                There are no Webhook Events added yet. Why don't you add one
                right now?
              </div>
            </div>
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
                <FontAwesomeIcon icon={faPlus} /> Add Webhook Trigger
              </Button>
            </div>
            <Modal show={modalName == "Trigger"} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Add Webhook</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="form-group">
                  <label htmlFor="webhook_url">Webhook URL</label>
                  <input
                    type="text"
                    className="form-control"
                    id="webhook_url"
                    placeholder="Webhook URL"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="webhook_icon">Webhook Icon</label>
                  <div id="webhook_icons" className="p-1">
                    {/* Font Awesome icons will be listed here */}
                    {icons.map((element) => {
                      if (element[1] == null) {
                        element[1] = "fas";
                      }

                      if (element[2] == null) {
                        element[2] = element[0];
                      }

                      return (
                        <div
                          className="btn btn-sm btn-info w-px-40 m-2"
                          onClick={() =>
                            setWebhookProps({
                              ...webhookProps,
                              icon: [element[1], element[2]],
                            })
                          }
                        >
                          <FontAwesomeIcon
                            icon={[element[1], element[2]]}
                            className="fs-md"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="webhook_color">Webhook Color</label>
                  <select className="form-control" id="webhook_color">
                    <option value="info">Cyan</option>
                    <option value="primary">Blue</option>
                    <option value="success">Green</option>
                    <option value="warning">Yellow</option>
                    <option value="danger">Red</option>
                    <option value="dark">Gray</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="webhook_title">Webhook Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="webhook_title"
                    placeholder="Webhook Title"
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseModal}
                >
                  <FontAwesomeIcon icon={faTimes} /> Close
                </Button>
                <Button variant="info" size="sm" onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faCheck} /> Save changes
                </Button>
              </Modal.Footer>
            </Modal>

            <div className="col-12 col-md-4 text-center pb-1 d-grid">
              <Button variant="info" size="sm">
                <FontAwesomeIcon icon={faPlus} /> Add Webhook Event
              </Button>
            </div>

            <div
              className="modal fade"
              id="add-event"
              tabIndex={-1}
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title text-info">Add Event</h5>
                    <button
                      type="button"
                      className="close mt-n4"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faTimes} className="fs-md" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="event_url">Event URL</label>
                      <input
                        type="text"
                        className="form-control"
                        id="event_url"
                        placeholder="Event URL"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="event_command">Trigger</label>
                      <select className="form-control" id="event_command">
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
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      data-dismiss="modal"
                    >
                      <FontAwesomeIcon icon={faTimes} /> Close
                    </button>
                    <button
                      id="submit_add_event"
                      type="button"
                      className="btn btn-sm btn-info"
                    >
                      <FontAwesomeIcon icon={faCheck} /> Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
              <FontAwesomeIcon icon={faCheck} /> Copied to Clipboard!
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
              <FontAwesomeIcon icon={faBook} className="mr-1" /> Documentation
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
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </h1>
                  <h4 id="alert-dialog-title"></h4>
                  <h6 id="alert-dialog-content" className="text-dark pt-2"></h6>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  <FontAwesomeIcon icon={faTimes} />
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

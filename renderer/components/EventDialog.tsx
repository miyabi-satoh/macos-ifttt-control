import React, { useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FaTimes, FaCheck } from "react-icons/fa";
import { OptionProps } from "../interfaces";

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

export type EventProps = {
  url: string;
  trigger: string;
};

type EventDialogProps = {
  show: boolean;
  onHide: () => void;
  onSubmit: SubmitHandler<EventProps>;
};

export function EventDialog(props: EventDialogProps) {
  const { show, onHide, onSubmit } = props;
  const { control, handleSubmit, reset } = useForm<EventProps>({
    defaultValues: {
      url: "",
      trigger: "auto-battery",
    },
  });

  useEffect(() => {
    reset();
  }, [show]);

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Event URL</Form.Label>
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="text"
                  placeholder="Event URL..."
                />
              )}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Trigger</Form.Label>
            <Controller
              name="trigger"
              control={control}
              render={({ field }) => (
                <Form.Select {...field}>
                  {eventTriggers.map((element: OptionProps, id) => {
                    if (element.value) {
                      return (
                        <option key={`trigger${id}`} value={element.value}>
                          {element.text || element.value}
                        </option>
                      );
                    } else {
                      return (
                        <option key={`trigger${id}`} disabled>
                          {element.text || element.value}
                        </option>
                      );
                    }
                  })}
                </Form.Select>
              )}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={onHide}>
            <FaTimes /> Close
          </Button>
          <Button variant="info" size="sm" type="submit" className="text-white">
            <FaCheck /> Save changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

import nodemailer from "nodemailer";
import * as mailer from "../../src/config/mailer"; // <-- update this

jest.mock("nodemailer");
jest.mock("fs");
jest.mock("handlebars");

describe("Mailer", () => {
  const sendMailMock = jest.fn();

  beforeEach(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    sendMailMock.mockClear();
  });

  describe("sendMail", () => {
    it("should send an email using nodemailer", () => {
      mailer.sendMail("sender@example.com", "recipient@example.com", {
        subject: "Test Subject",
        text: "Test Text",
        html: "<b>Test</b>"
      });


      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test Text",
        html: "<b>Test</b>"
      }));
    });
  });

});

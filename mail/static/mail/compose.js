document.addEventListener(
  "DOMContentLoaded",
  function () {
    const form = document.querySelector("#compose-form");
    const msg = document.querySelector("#message");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      to = document.querySelector("#compose-recipients").value;
      subject = document.querySelector("#compose-subject").value;
      body = document.querySelector("#compose-body").value;
      if (subject.length == 0 && to.length == 0) return;

      fetch("/emails", {
        method: "POST",
        body: JSON.stringify({
          recipients: to,
          subject: subject,
          body: body,
        }),
      })
      .then((response) => response.json())
      .then((result) => {
        //console.log(result.status);
        if (!result.status == 201) {
          msg.innerHTML = `<div class="alert alert-danger" role="alert">
          ${result.error}
        </div>`;
        } else {
          load_mailbox("sent");
        }
      });
  });
  })
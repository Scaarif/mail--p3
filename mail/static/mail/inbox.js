document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send the email on form submission
  const form = document.querySelector("#compose-form");
  //form.addEventListener("submit", send_mail(event));
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
  }
  

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  if (mailbox == "show_mail"){ //what does this mean?
    show_mail();
    return;
  }

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach((element) => {
        if (mailbox != "sent") {
          sender_recipients = element.sender;
        } else {
          sender_recipients = element.recipients;
        }
        if (mailbox == "inbox") {
          if (element.read) is_read = "read";
          else is_read = "";
        } else is_read = "";
        var item = document.createElement("div");
        item.className = `card ${is_read} my-1 items`;

        item.innerHTML = `<div class="card-body" id="item-${element.id}">
        ${element.subject} | ${sender_recipients} | ${element.timestamp}
        <br>
        ${element.body.slice(0,50)}...
        </div>`;
        document.querySelector("#emails-view").appendChild(item);
        item.addEventListener("click", () => {
          show_mail(element.id, mailbox);
        });
      });
    });
}

function show_mail(email_id, mailbox) {
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    //Print the email
    document.querySelector("#emails-view").innerHTML = "";

    var item = document.createElement("div");
    item.className = `card`; 
    item.innerHTML = `<div class="card-body" style="white-space: pre-wrap;">
    Sender: ${email.sender}
    Recipients: ${email.recipients}
    Subject: ${email.subject}
    Time: ${email.timestamp}
    <br> ${email.body}
    </div>`;
    document.querySelector("#emails-view").appendChild(item);

    if (mailbox == "sent") return; //i.e dont include the reply or archive toogle buttons. Else ...
    let archive = document.createElement("button");
    archive.className = `btn btn-outline-info my-2`;
    archive.addEventListener("click", () => {
      toggle_archive(email_id, email.archived);
      if (archive.innerText == "Archive") archive.innerText = "Unarchive";
      else archive.innerText = "Archive";
      document.querySelector("#emails-view").appendChild(archive);
    });
    if (!email.archived) archive.textContent = "Archive";
    else archive.textContent = "Unarchive";
    document.querySelector("#emails-view").appendChild(archive);

    let reply = document.createElement("button");
    reply.className = `btn btn-outline-success m-2 `;
    reply.textContent =  "Reply";
    reply.addEventListener("click", () => {
      reply_mail(email.sender, email.subject, email.body, email.timestamp);
    });
    document.querySelector("#emails-view").appendChild(reply);
    make_read(email_id);
  });
}

function toggle_archive(email_id, state) {
  fetch(`emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
}

function make_read(email_id){
  fetch(`emails/${email_id}`, {
    method: "PUT", 
    body: JSON.stringify({
        read: true,
    }),
  });
}

function reply_mail(sender, subject, body, timestamp) {
  compose_email();
  if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  pre_fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;

  document.querySelector("#compose-body").value = pre_fill;
}



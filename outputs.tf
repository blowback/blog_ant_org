output "server_ipv4" {
  description = "Point your A records here."
  value       = hcloud_server.blog.ipv4_address
}

output "server_ipv6" {
  description = "Optional: point AAAA records here."
  value       = hcloud_server.blog.ipv6_address
}

output "a_records_to_create" {
  description = "Create these A records at your DNS host."
  value = {
    (var.blog_domain)     = hcloud_server.blog.ipv4_address
    (var.comments_domain) = hcloud_server.blog.ipv4_address
  }
}

output "dkim_cname_records_to_create" {
  description = "Create these CNAME records to verify SES and enable DKIM."
  value = [
    for t in aws_sesv2_email_identity.blog.dkim_signing_attributes[0].tokens : {
      name  = "${t}._domainkey.${local.email_domain}"
      value = "${t}.dkim.amazonses.com"
    }
  ]
}

output "smtp_host" {
  value = "email-smtp.${var.aws_region}.amazonaws.com"
}

output "smtp_username" {
  value     = aws_iam_access_key.ses.id
  sensitive = true
}

output "smtp_password" {
  value     = aws_iam_access_key.ses.ses_smtp_password_v4
  sensitive = true
}

output "next_steps" {
  value = <<-EOT

    1. Create the A records in `a_records_to_create` and the CNAMEs in
       `dkim_cname_records_to_create` at your DNS host. Caddy retries ACME
       automatically, so it gets certs as soon as the A records resolve.

    2. SES starts in SANDBOX (only sends to verified addresses). For a personal
       blog you can verify your own address and stay in sandbox, or request
       production access in the SES console (${var.aws_region}).

    3. Check the server IP against blocklists (e.g. Spamhaus). If it's listed,
       roll a fresh one:  terraform apply -replace=hcloud_server.blog

    4. Give cloud-init ~3-5 min, then open https://${var.blog_domain}/ghost
       to create your admin account.

    SMTP creds: terraform output -raw smtp_username / smtp_password
  EOT
}

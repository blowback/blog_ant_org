locals {
  email_domain = var.email_domain != "" ? var.email_domain : var.blog_domain
  mail_from    = var.mail_from != "" ? var.mail_from : "noreply@${local.email_domain}"

  cloud_init = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    blog_domain         = var.blog_domain
    comments_domain     = var.comments_domain
    acme_email          = var.acme_email
    mysql_root_password = random_password.mysql_root.result
    ghost_db_password   = random_password.ghost_db.result
    remark_secret       = random_password.remark_secret.result
    smtp_host           = "email-smtp.${var.aws_region}.amazonaws.com"
    smtp_user           = aws_iam_access_key.ses.id
    smtp_pass           = aws_iam_access_key.ses.ses_smtp_password_v4
    mail_from           = local.mail_from
    gh_cid              = var.gh_cid
    gh_csec             = var.gh_csec
    remark_admin_id     = var.remark_admin_id
  })
}

# ---- Generated secrets (live only in the server's /opt/blog/.env) ----
resource "random_password" "mysql_root" {
  length  = 32
  special = false
}

resource "random_password" "ghost_db" {
  length  = 32
  special = false
}

resource "random_password" "remark_secret" {
  length  = 48
  special = false
}

# ---- SSH key ----
resource "hcloud_ssh_key" "admin" {
  name       = "blog-admin"
  public_key = var.ssh_public_key
}

# ---- Firewall: 80/443 open to the world, SSH locked to your IP ----
# No outbound rules => egress is unrestricted (needed for Docker pulls + SES).
resource "hcloud_firewall" "blog" {
  name = "blog-fw"

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = [var.ssh_source_cidr]
  }
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  rule {
    direction  = "in"
    protocol   = "udp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

# ---- The server ----
resource "hcloud_server" "blog" {
  name         = "blog"
  server_type  = var.server_type
  image        = "ubuntu-24.04"
  location     = var.location
  ssh_keys     = [hcloud_ssh_key.admin.id]
  firewall_ids = [hcloud_firewall.blog.id]
  user_data    = local.cloud_init

  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }

  labels = {
    role = "blog"
  }
}

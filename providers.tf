# HCLOUD_TOKEN can be set via env var instead of the variable.
provider "hcloud" {
  token = var.hcloud_token
}

# AWS credentials come from the environment (AWS_ACCESS_KEY_ID /
# AWS_SECRET_ACCESS_KEY or a shared profile) — never put them in tfvars.
# The region matters: SES SMTP credentials are derived per-region, so this
# region must match the SES endpoint Ghost connects to.
provider "aws" {
  region = var.aws_region
}

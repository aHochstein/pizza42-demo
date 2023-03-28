terraform {
  required_providers {
    auth0 = {
      source  = "auth0/auth0"
      version = "~> 0.44.0"
    }
  }
}

provider "auth0" {
  domain        = var.auth0_tenant_domain
  client_id     = var.auth0_tenant_client_id
  client_secret = var.auth0_tenant_client_secret
}

resource "auth0_prompt" "prompt" {
  universal_login_experience     = "new"
  identifier_first               = true
  webauthn_platform_first_factor = true
}

resource "auth0_guardian" "mfa_settings" {
  policy        = "confidence-score"
  otp           = true
  recovery_code = true
  webauthn_platform {
    enabled = true
  }
}

resource "auth0_action" "fetch_user_crm" {
  name    = "fetch_user_data_from_crm"
  runtime = "node16"
  deploy  = true
  code    = file("./actions/fetch_user_data_from_crm.js")

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }

  dependencies {
    name    = "axios"
    version = "latest"
  }
}

resource "auth0_action" "step_up_mfa" {
  name    = "step_up_mfa"
  runtime = "node16"
  deploy  = true
  code    = file("./actions/step_up_mfa.js")

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }
}

resource "auth0_action" "add_address_to_id_token" {
  name    = "add_address_to_id_token"
  runtime = "node16"
  deploy  = true
  code    = file("./actions/add_address_to_id_token.js")

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }
}

resource "auth0_action" "progressive_profilling" {
  name    = "progressive_profiling"
  runtime = "node16"
  deploy  = true
  code    = file("./actions/progressive_profiling.js")
  supported_triggers {
    id      = "post-login"
    version = "v3"
  }

  dependencies {
    name    = "@felixcolaci/auth0-progressive-profiling-action"
    version = "latest"
  }

  secrets {
    name  = "TOKEN_SIGNING"
    value = "SUPERSECRET"
  }
}

resource "auth0_trigger_binding" "login_flow" {
  trigger = "post-login"

  actions {
    id           = auth0_action.fetch_user_crm.id
    display_name = auth0_action.fetch_user_crm.name
  }

  actions {
    id           = auth0_action.step_up_mfa.id
    display_name = auth0_action.step_up_mfa.name
  }

  actions {
    id           = auth0_action.progressive_profilling.id
    display_name = auth0_action.progressive_profilling.name
  }

  actions {
    id           = auth0_action.add_address_to_id_token.id
    display_name = auth0_action.add_address_to_id_token.name
  }

}

resource "auth0_connection" "google_oauth2" {
  name     = "Google-OAuth2-Connection"
  strategy = "google-oauth2"

  options {
    scopes                   = ["email", "profile"]
    set_user_root_attributes = "on_each_login"
  }
}

resource "auth0_connection" "users" {
  name                 = "Users-Connection"
  is_domain_connection = true
  strategy             = "auth0"
  options {
    enabled_database_customization = true
    disable_signup                 = false
    import_mode                    = true
    password_policy                = "excellent"
    custom_scripts = {
      login = file("./database/login.js")
    }
    configuration = {
      client_id         = var.migration_tenant_client_id
      client_secret     = var.migration_tenant_client_secret
      token_endpoint    = var.migration_tenant_token_endpoint
      userinfo_endpoint = var.migration_tenat_userinfo_endpoint
    }

  }
}

resource "auth0_client" "pizza42" {
  name                       = "Pizza42"
  description                = "Pizza 42 Application"
  app_type                   = "spa"
  token_endpoint_auth_method = "none"
  is_first_party             = true
  grant_types = [
    "authorization_code"
  ]
  jwt_configuration {
    lifetime_in_seconds = 3000
    secret_encoded      = true
    alg                 = "RS256"
  }
  callbacks           = ["https://pizza42.authfest.com"]
  allowed_logout_urls = ["https://pizza42.authfest.com"]
  web_origins         = ["https://pizza42.authfest.com"]
}

resource "auth0_connection_client" "pizza42_client_google_connection" {
  connection_id = auth0_connection.google_oauth2.id
  client_id     = auth0_client.pizza42.client_id
}

resource "auth0_connection_client" "pizza42_demo_client_users_connection" {
  connection_id = auth0_connection.users.id
  client_id     = auth0_client.pizza42.id
}

resource "auth0_attack_protection" "attack_protection" {
  breached_password_detection {
    admin_notification_frequency = ["daily"]
    enabled                      = true
    method                       = "standard"
    shields                      = ["admin_notification", "block"]

    pre_user_registration {
      shields = ["block"]
    }
  }
}

resource "auth0_branding_theme" "my_theme" {
  fonts {
    title {}
    subtitle {}
    links {}
    input_labels {}
    buttons_text {}
    body_text {}
  }

  borders {
    show_widget_shadow   = false
    widget_border_weight = 1
    widget_corner_radius = 50
  }

  colors {

    primary_button           = "#30AAC0"
    base_focus_color         = "#30AAC0"
    links_focused_components = "#30AAC0"
  }

  page_background {
    background_image_url = "https://pizza42.authfest.com/images/bg_pizzeria.jpg"
    page_layout          = "center"
  }

  widget {
    header_text_alignment = "center"
    logo_height           = 100
    logo_position         = "center"
    logo_url              = "https://pizza42-demo.vercel.app/images/pizza42_logo.png"
    social_buttons_layout = "top"
  }
}
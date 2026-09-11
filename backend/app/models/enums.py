import enum


class UserRole(enum.StrEnum):
    asha = "asha"
    phc_mo = "phc_mo"
    facility_staff = "facility_staff"
    cdmo = "cdmo"
    admin = "admin"


class IntakeSource(enum.StrEnum):
    online = "online"
    offline_sync = "offline_sync"


class RiskLevel(enum.StrEnum):
    low = "low"
    moderate = "moderate"
    red_flag = "red_flag"


class RiskSource(enum.StrEnum):
    rule_engine = "rule_engine"
    llm_assist = "llm_assist"


class ReferralStatus(enum.StrEnum):
    issued = "issued"
    en_route = "en_route"
    arrived = "arrived"
    no_show = "no_show"
    treated = "treated"
    followed_up = "followed_up"


class IntegrationSystem(enum.StrEnum):
    abha = "abha"
    esanjeevani = "esanjeevani"
    dispatch_108 = "dispatch_108"

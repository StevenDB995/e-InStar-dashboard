package hk.hku.dashboard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("dashboard/production")
    public String routeProduction() {
        return "dashboard/production";
    }

}

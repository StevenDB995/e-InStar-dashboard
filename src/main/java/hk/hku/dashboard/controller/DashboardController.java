package hk.hku.dashboard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("dashboard/home")
    public String home() {
        return "dashboard/home_new";
    }

    @GetMapping("dashboard")
    public String dashboard() {
        return "dashboard/dashboard";
    }

}

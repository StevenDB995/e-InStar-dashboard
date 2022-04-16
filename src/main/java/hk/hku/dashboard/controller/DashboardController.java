package hk.hku.dashboard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("dashboard/home")
    public String home() {
        return "dashboard/home";
    }

    @GetMapping("dashboard")
    public String dashboard() {
        return "dashboard/dashboard";
    }

    @GetMapping("test")
    public String test() {
        return "test";
    }

}

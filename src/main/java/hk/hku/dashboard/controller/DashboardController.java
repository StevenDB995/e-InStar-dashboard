package hk.hku.dashboard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.Map;

@Controller
public class DashboardController {

    @GetMapping("dashboard")
    public String home() {
        return "dashboard/home";
    }

    @GetMapping("dashboard/logistics")
    public String logistics() {
        return "dashboard/logistics";
    }

    @GetMapping("dashboard/production")
    public String production(Model model) {
        Map<String, Object> student = new HashMap<>();
        student.put("name", "David");
        student.put("age", 18);
        model.addAttribute("student", student);

        return "dashboard/production";
    }

}

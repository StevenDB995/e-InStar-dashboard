package hk.hku.dashboard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.Map;

@Controller
public class DashboardController {

    @GetMapping("dashboard/production")
    public String routeProduction(Model model) {
        Map<String, Object> student = new HashMap<>();
        student.put("name", "David");
        student.put("age", 18);
        model.addAttribute("student", student);

        return "dashboard/production";
    }

}

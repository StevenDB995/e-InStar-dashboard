package hk.hku.dashboard.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @Value("${app.secrets.mapboxAccessToken}")
    private String mapboxToken;

    @GetMapping("/home")
    public String home() {
        return "dashboard/home_new";
    }

    @GetMapping({"", "/"})
    public String dashboard() {
        return "dashboard/index";
    }

    @GetMapping("mapbox-token")
    @ResponseBody
    public String getMapboxToken() {
        return mapboxToken;
    }

}

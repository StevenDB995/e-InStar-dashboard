package hk.hku.dashboard.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourcesConfiguration implements WebMvcConfigurer {

    private static final String CLASSPATH_RESOURCE_LOCATION = "classpath:/static/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/js/threejs/**")
                .addResourceLocations(CLASSPATH_RESOURCE_LOCATION + "js/threejs/")
                .setCacheControl(CacheControl.noCache());

        registry.addResourceHandler("/js/3d-model/**")
                .addResourceLocations(CLASSPATH_RESOURCE_LOCATION + "js/3d-model/")
                .setCacheControl(CacheControl.noCache());

        registry.addResourceHandler("/newmodel/**")
                .addResourceLocations(CLASSPATH_RESOURCE_LOCATION + "newmodel/")
                .setCacheControl(CacheControl.noCache());
    }

}

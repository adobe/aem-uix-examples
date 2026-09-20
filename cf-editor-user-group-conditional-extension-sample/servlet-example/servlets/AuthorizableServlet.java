package com.extensibilityteam.core.servlets;

import com.adobe.granite.security.user.UserProperties;
import com.adobe.granite.security.user.UserPropertiesManager;
import com.adobe.granite.security.user.UserPropertiesService;
import com.drew.lang.annotations.NotNull;
import com.extensibilityteam.core.data.AuthorizableGroupData;
import com.extensibilityteam.core.data.AuthorizableUserData;
import com.google.gson.Gson;
import org.apache.jackrabbit.api.security.user.Authorizable;
import org.apache.jackrabbit.api.security.user.Group;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.request.RequestParameterMap;
import org.apache.sling.api.resource.ResourceResolver;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import java.io.IOException;
import java.util.*;


@Component(service = {Servlet.class},
        property = {"sling.servlet.methods=GET", "sling.servlet.paths=/bin/authorizable"})
public class AuthorizableServlet extends AbstractServlet {

    private static final Logger log = LoggerFactory.getLogger(AuthorizableServlet.class);

    @Reference
    private UserPropertiesService userPropertiesService;

    @Override
    protected void doGet(@NotNull SlingHttpServletRequest request, @NotNull SlingHttpServletResponse response) throws ServletException, IOException {
        ResourceResolver resolver = request.getResourceResolver();
        Authorizable authorizable = request.getResource().adaptTo(Authorizable.class);
        if (authorizable == null) {
            authorizable = resolver.adaptTo(Authorizable.class);
        }

        try {
            if (authorizable != null) {
                Session session = resolver.adaptTo(Session.class);
                UserPropertiesManager userPropertiesManager =
                        userPropertiesService.createUserPropertiesManager(session, resolver);

                RequestParameterMap params = request.getRequestParameterMap();
                Set<String> outputProps = getProps(params);
                setJsonResponseHeader(response);

                if (outputProps.contains("memberOf")) {
                    AuthorizableUserData authorizableData = buildAuthorizableData(authorizable, userPropertiesManager);
                    Gson gson = new Gson();
                    String jsonResponse = gson.toJson(authorizableData);
                    setJsonResponseHeader(response);
                    response.getWriter().write(jsonResponse);
                }
            } else {
                log.debug("No valid authorizable at the path.");
                response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error in processing GET request: {}", e.getMessage(), e);
            response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private AuthorizableUserData buildAuthorizableData(Authorizable authorizable, UserPropertiesManager userPropertiesManager) throws Exception {
        String id = authorizable.getID();
        AuthorizableUserData data = new AuthorizableUserData();
        data.setAuthorizableId(id);
        data.setHome(authorizable.getPath());
        data.setType(authorizable.isGroup() ? "group" : "user");
        data.setName(this.getDisplayName(id, userPropertiesManager));
        List<AuthorizableGroupData> groups = new ArrayList<>();
        Iterator<Group> groupsIterator = authorizable.memberOf();

        while (groupsIterator.hasNext()) {
            AuthorizableGroupData groupData = new AuthorizableGroupData();
            Group group = groupsIterator.next();
            groupData.setAuthorizableId(group.getID());
            groupData.setHome(group.getPath());
            groupData.setName(this.getDisplayName(group.getID(), userPropertiesManager));
            groups.add(groupData);
        }

        data.setMemberOf(groups);

        return data;
    }

    private String getDisplayName(String id, UserPropertiesManager userPropertiesManager) {
        String name = id;
        UserProperties up = this.getProfile(id, userPropertiesManager);
        if (up != null) {
            try {
                name = up.getDisplayName();
            } catch (RepositoryException var5) {
                log.debug("Cannot retrieve display name for {}", id);
            }
        }

        return name;
    }

    private UserProperties getProfile(String id, UserPropertiesManager userPropertiesManager) {
        try {
            return userPropertiesManager.getUserProperties(id, "profile");
        } catch (RepositoryException e) {
            log.debug("Could not access Repository, when trying to access full name of {}", id);
        }

        return null;
    }
}

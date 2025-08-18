package com.extensibilityteam.core.data;

import com.google.gson.annotations.SerializedName;

public class AuthorizableGroupData {
    @SerializedName("authorizableId")
    private String authorizableId;

    @SerializedName("name")
    private String name;

    @SerializedName("home")
    private String home;

    public String getAuthorizableId() {
        return authorizableId;
    }

    public void setAuthorizableId(String authorizableId) {
        this.authorizableId = authorizableId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHome() {
        return home;
    }

    public void setHome(String home) {
        this.home = home;
    }
}
package com.extensibilityteam.core.data;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class AuthorizableUserData {
    @SerializedName("type")
    private String type;

    @SerializedName("authorizableId")
    private String authorizableId;

    @SerializedName("name")
    private String name;

    @SerializedName("home")
    private String home;

    @SerializedName("memberOf")
    private List<AuthorizableGroupData> memberOf;

    // Getters and setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

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

    public List<AuthorizableGroupData> getMemberOf() {
        return memberOf;
    }

    public void setMemberOf(List<AuthorizableGroupData> memberOf) {
        this.memberOf = memberOf;
    }
}

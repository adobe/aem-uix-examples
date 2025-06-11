/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
package com.extensibilityteam.core.servlets;

import com.adobe.granite.security.user.util.PropConstants;
import org.apache.sling.api.request.RequestParameter;
import org.apache.sling.api.request.RequestParameterMap;
import org.apache.sling.api.servlets.HtmlResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * AbstractServlet...
 */
abstract class AbstractServlet extends SlingAllMethodsServlet implements PropConstants {

    private static final Logger log = LoggerFactory.getLogger(AbstractServlet.class);

    /**
     * Number of results (optional). If set to a positive integer <em>n</em>, no more than <em>n</em> results are
     * returned.
     */
    protected static final String PARAM_MAX = "max";

    /**
     * Maximal number of records to include in properties having detail records
     */
    protected static final String PARAM_MEMBER_LIMIT = "ml";

    /**
     * Offset for paging (optional). If set to a positive integer <em>n</em>, the first <em>n</em> results from
     * the query are skipped.
     */
    protected static final String PARAM_OFFSET = "offset";

    /**
     * Path parameter
     */
    protected static final String PARAM_PATH = "path";

    /**
     * A comma separated list of properties to include/exclude from the result (optional). If the list contains
     * an asterisk (*), all but the specified properties are included. Otherwise only the specified properties
     * are included. Examples: {@code props=id,age} includes only the id and the age property while
     * {@code props=*,id,age} includes all but the id and the age property.
     */
    protected static final String PARAM_PROPS = "props";

    /**
     * A query string in JSON format (required). See above for examples and see
     * {@link org.apache.jackrabbit.commons.jackrabbit.user.AuthorizableQueryManager#execute(String)}
     * for syntax and semantics.
     */
    protected static final String PARAM_QUERY = "query";

    /**
     * Returns {@code true} if the specified paramName is contained in the
     * set of reserved names or starts with ";" or starts with "?".
     *
     * @param paramName
     * @param reserved
     * @return {@code true} if the specified paramName is reserved,
     * {@code false} otherwise.
     */
    protected static boolean isReservedParameter(String paramName, Set<String> reserved) {
        return reserved.contains(paramName) || paramName.startsWith(":") || paramName.startsWith("_");
    }

    protected static String getStringValue(RequestParameterMap params, String name, String defaultValue) {
        RequestParameter value = params.getValue(name);
        if (value != null) {
            return value.toString();
        } else {
            return defaultValue;
        }
    }

    protected static long getNonNegativeValue(RequestParameterMap params, String name, long defaultValue) {
        RequestParameter value = params.getValue(name);
        if (value != null) {
            try {
                long lv = Long.valueOf(params.getValue(name).getString());
                if (lv >= 0) {
                    return lv;
                }
            } catch (NumberFormatException e) {
                /* empty */
            }
            log.warn("Require non negative long for {}, found {}", name, value.getString());
        }
        return defaultValue;
    }

    protected static Set<String> getProps(RequestParameterMap params) {
        RequestParameter val = params.getValue(PARAM_PROPS);
        if (val != null) {
            String[] props = val.getString().split(",");
            if (props.length > 0) {
                Set<String> set = new HashSet<String>();
                set.addAll(Arrays.asList(props));
                return set;
            }
        }
        return Collections.emptySet();
    }

    protected static void setJsonResponseHeader(HttpServletResponse response) {
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
    }

    protected static HtmlResponse createErrorResponse(Exception e) {
        HtmlResponse errorResponse = new HtmlResponse();
        errorResponse.setError(e);
        return errorResponse;
    }

    protected static HtmlResponse createErrorResponse(int status, Exception e) {
        return createErrorResponse(status, e.getMessage());
    }

    protected static HtmlResponse createErrorResponse(int status, String message) {
        HtmlResponse errorResponse = new HtmlResponse();
        errorResponse.setStatus(status, message);
        if (status < 400) {
            errorResponse.setTitle("OK");
        } else {
            errorResponse.setTitle("Error");
        }
        return errorResponse;
    }
}
